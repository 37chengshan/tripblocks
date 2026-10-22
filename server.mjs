import { createServer } from "node:http";
import { execFile } from "node:child_process";
import { readFile, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL(".", import.meta.url));
const agentDir = join(root, "agent");
const agentFile = join(agentDir, "agents.yaml");
const localBl = join(root, "node_modules", ".bin", "bl");
const bl = process.env.BL_BIN || (existsSync(localBl) ? localBl : "bl");
const localFlyAI = join(root, "node_modules", ".bin", "flyai");
const flyai = process.env.FLYAI_BIN || (existsSync(localFlyAI) ? localFlyAI : "flyai");
const flyaiCache = new Map();
const port = Number(process.env.PORT || 8787);
const dist = join(root, "dist");

const mime = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".json": "application/json; charset=utf-8",
  ".woff2": "font/woff2",
};

function json(res, status, body) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" });
  res.end(JSON.stringify(body));
}

function buildPrompt(prompt, trip) {
  return `You are Wander, a concise travel-planning partner inside TripBlocks. You are warm, specific, and never generic.

The traveler's current plan is:
${JSON.stringify(trip)}

They asked: ${prompt}

Answer in 2-4 short sentences (under 90 words). Refer to actual days, places, times or costs from the plan. Do not use markdown tables or headings. If you propose a new block, append exactly one fenced json code block at the very end:
\`\`\`json
{"suggestion":{"title":"...","place":"...","kind":"explore","dayId":5,"start":"15:30","duration":60,"cost":1200,"note":"one short reason"}}
\`\`\`
kind must be one of travel, stay, explore, food, reset. dayId must be 1-7. cost is JPY for two people. Do not include more than one suggestion. If no block is needed, omit the json block.`;
}

function parseAgentOutput(stdout) {
  const start = stdout.indexOf("{");
  const end = stdout.lastIndexOf("}");
  if (start < 0 || end < start) throw new Error("Agent returned no JSON envelope");
  const envelope = JSON.parse(stdout.slice(start, end + 1));
  const events = Array.isArray(envelope.events) ? envelope.events : [];
  const text = events
    .filter((event) => event?.type === "message" && event?.role === "assistant")
    .flatMap((event) => (Array.isArray(event.content) ? event.content : []))
    .filter((part) => part?.type === "text" && typeof part.text === "string")
    .map((part) => part.text.trim())
    .filter(Boolean)
    .join("\n\n")
    .trim();
  if (!text) throw new Error("Agent returned no assistant message");

  let suggestion;
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced?.[1]) {
    try {
      const parsed = JSON.parse(fenced[1]);
      const candidate = parsed?.suggestion ?? parsed;
      if (candidate && typeof candidate.title === "string" && typeof candidate.dayId === "number") {
        suggestion = {
          title: String(candidate.title).slice(0, 120),
          place: String(candidate.place ?? "To be decided").slice(0, 160),
          kind: ["travel", "stay", "explore", "food", "reset"].includes(candidate.kind) ? candidate.kind : "explore",
          dayId: Math.min(7, Math.max(1, Math.round(candidate.dayId))),
          start: /^\d{2}:\d{2}$/.test(candidate.start) ? candidate.start : "10:00",
          duration: Math.min(600, Math.max(15, Number(candidate.duration) || 60)),
          cost: Math.max(0, Number(candidate.cost) || 0),
          note: String(candidate.note ?? "Suggested by Wander.").slice(0, 240),
        };
      }
    } catch {
      // A malformed suggestion should not hide the useful answer.
    }
  }

  const cleanText = text.replace(/```(?:json)?\s*[\s\S]*?```/gi, "").trim();
  return { text: cleanText || text, suggestion, sessionId: envelope.session_id };
}

async function runLocalModel(prompt, trip) {
  const base = process.env.LOCAL_MODEL_BASE_URL || "http://127.0.0.1:10100/v1";
  const model = process.env.LOCAL_MODEL || "intern/qwen3.8-27b";
  const response = await fetch(`${base}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(process.env.LOCAL_MODEL_API_KEY ? { Authorization: `Bearer ${process.env.LOCAL_MODEL_API_KEY}` } : {}),
    },
    signal: AbortSignal.timeout(50000),
    body: JSON.stringify({
      model,
      temperature: 0.7,
      max_tokens: 900,
      enable_thinking: false,
      messages: [
        { role: "system", content: "You are Wander, a concise travel-planning partner. Answer in 2-4 sentences and refer to actual days, places, times or costs. If you propose a block, append one fenced JSON block with a suggestion object containing title, place, kind, dayId, start, duration, cost, note." },
        { role: "user", content: buildPrompt(prompt, trip) },
      ],
    }),
  });
  if (!response.ok) throw new Error(`Local model failed: ${response.status}`);
  const data = await response.json();
  const message = data?.choices?.[0]?.message;
  const text = message?.content || message?.reasoning_content;
  if (typeof text !== "string" || !text.trim()) throw new Error("Local model returned no text");
  const parsed = parseAgentOutput(JSON.stringify({ events: [{ type: "message", role: "assistant", content: [{ type: "text", text }] }] }));
  return { ...parsed, source: "local" };
}

function runAgent(prompt, trip) {
  return new Promise((resolve, reject) => {
    const args = [
      "managed-agent",
      "session",
      "run",
      "--agent",
      "admin",
      "--environment",
      "dev-2",
      "--file",
      agentFile,
      "--no-stream",
      "--output",
      "json",
      "--title",
      `TripBlocks · ${new Date().toISOString().slice(0, 10)}`,
      "--prompt",
      buildPrompt(prompt, trip),
    ];
    execFile(
      bl,
      args,
      { cwd: agentDir, timeout: 52000, maxBuffer: 4 * 1024 * 1024, env: process.env },
      (error, stdout, stderr) => {
        if (error) {
          reject(new Error(stderr?.trim() || error.message));
          return;
        }
        try {
          resolve(parseAgentOutput(stdout));
        } catch (parseError) {
          reject(parseError);
        }
      },
    );
  });
}

function runFlyAI(args) {
  return new Promise((resolve, reject) => {
    execFile(
      flyai,
      args,
      { cwd: root, timeout: 30000, maxBuffer: 8 * 1024 * 1024, env: process.env },
      (error, stdout, stderr) => {
        if (error) {
          reject(new Error(stderr?.trim() || error.message));
          return;
        }
        try {
          resolve(JSON.parse(stdout.trim()));
        } catch {
          reject(new Error("FlyAI returned invalid JSON"));
        }
      },
    );
  });
}

function normalizeFlyAI(payload, kind) {
  const items = Array.isArray(payload?.data?.itemList) ? payload.data.itemList : [];
  return items.slice(0, 12).map((item, index) => {
    const priceText = typeof item.price === "string" ? item.price : "";
    const price = Number(priceText.replace(/[^0-9.]/g, "")) || 0;
    if (kind === "hotel") {
      return {
        id: String(item.shId || `hotel-${index}`),
        kind,
        name: String(item.name || "Stay"),
        image: String(item.mainPic || ""),
        price,
        priceLabel: priceText || "Live rate",
        meta: [item.star, item.interestsPoi].filter(Boolean).join(" · "),
        address: String(item.address || ""),
        description: String(item.review || item.interestsPoi || ""),
        link: String(item.detailUrl || ""),
      };
    }
    return {
      id: String(item.id || `poi-${index}`),
      kind: "poi",
      name: String(item.name || "Place"),
      image: String(item.mainPic || ""),
      price,
      priceLabel: priceText || (item.ticketInfo ? "Ticket info" : "Free to explore"),
      meta: [item.category, item.poiLevel].filter(Boolean).join(" · ") || "Kyoto",
      address: String(item.address || ""),
      description: String(item.description || "").slice(0, 220),
      link: String(item.jumpUrl || ""),
    };
  });
}

async function readBody(req) {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > 400_000) throw new Error("Payload too large");
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString("utf8");
}

async function serveStatic(req, res) {
  if (!existsSync(dist)) {
    json(res, 404, { error: "Not found" });
    return;
  }
  const url = new URL(req.url ?? "/", `http://${req.headers.host}`);
  const requested = decodeURIComponent(url.pathname);
  const safe = normalize(requested).replace(/^(\.\.[/\\])+/, "");
  let file = join(dist, safe);
  try {
    const info = await stat(file);
    if (info.isDirectory()) file = join(file, "index.html");
  } catch {
    file = join(dist, "index.html");
  }
  try {
    const body = await readFile(file);
    res.writeHead(200, { "Content-Type": mime[extname(file)] ?? "application/octet-stream" });
    res.end(body);
  } catch {
    json(res, 404, { error: "Not found" });
  }
}

const server = createServer(async (req, res) => {
  try {
    if (req.method === "GET" && req.url === "/api/health") {
      json(res, 200, { ok: true, agent: "admin", runtime: "bailian-managed-agent" });
      return;
    }
    if (req.method === "GET" && req.url?.startsWith("/api/flyai")) {
      const url = new URL(req.url, `http://${req.headers.host}`);
      const kind = url.searchParams.get("kind") === "hotel" ? "hotel" : "poi";
      const city = (url.searchParams.get("city") || "京都").trim();
      if (!city || city.length > 30) {
        json(res, 400, { error: "Valid city is required" });
        return;
      }
      const checkIn = url.searchParams.get("checkIn") || "";
      const checkOut = url.searchParams.get("checkOut") || "";
      const cacheKey = `${kind}:${city}:${checkIn}:${checkOut}`;
      const cached = flyaiCache.get(cacheKey);
      if (cached && Date.now() - cached.at < 10 * 60 * 1000) {
        json(res, 200, cached.value);
        return;
      }
      const args = kind === "hotel"
        ? ["search-hotel", "--dest-name", city, ...(checkIn ? ["--check-in-date", checkIn] : []), ...(checkOut ? ["--check-out-date", checkOut] : [])]
        : ["search-poi", "--city-name", city];
      try {
        const payload = await runFlyAI(args);
        const value = { source: "flyai", kind, city, items: normalizeFlyAI(payload, kind), hint: payload?.systemMessage ?? null };
        flyaiCache.set(cacheKey, { at: Date.now(), value });
        json(res, 200, value);
      } catch (error) {
        console.error("[flyai]", error instanceof Error ? error.message : error);
        json(res, 503, { error: "FlyAI unavailable", source: "unavailable" });
      }
      return;
    }

    if (req.method === "POST" && req.url === "/api/agent") {
      const body = JSON.parse(await readBody(req));
      if (!body?.prompt || typeof body.prompt !== "string" || !body?.trip) {
        json(res, 400, { error: "prompt and trip are required" });
        return;
      }
      try {
        const result = await runAgent(body.prompt.slice(0, 2000), body.trip);
        json(res, 200, { ...result, source: "managed-agent" });
      } catch (agentError) {
        console.error("[agent]", agentError instanceof Error ? agentError.message : agentError);
        if (process.env.AGENT_FALLBACK !== "off") {
          try {
            const local = await runLocalModel(body.prompt.slice(0, 2000), body.trip);
            json(res, 200, { ...local, fallback: true });
          } catch (localError) {
            console.error("[fallback]", localError instanceof Error ? localError.message : localError);
            json(res, 503, { error: "No model available", source: "unavailable" });
          }
        } else {
          json(res, 503, { error: "Managed Agent unavailable", source: "unavailable" });
        }
      }
      return;
    }
    if (req.method === "GET") {
      await serveStatic(req, res);
      return;
    }
    json(res, 405, { error: "Method not allowed" });
  } catch (error) {
    console.error("[server]", error);
    json(res, 500, { error: "Internal error" });
  }
});

server.listen(port, "127.0.0.1", () => {
  console.log(`TripBlocks agent server on http://127.0.0.1:${port}`);
});
