import { useEffect, useRef, useState } from "react";
import { ArrowUp, ChevronRight, CircleDot, CloudRain, Clock3, Plus, ShieldCheck, Sparkles, X } from "lucide-react";
import { cityMeta, formatYen, kindMeta, quickPrompts } from "../data";
import type { ChatMessage, Suggestion, Trip } from "../types";
import { KindIcon } from "./KindIcon";

export function Companion({
  trip,
  messages,
  thinking,
  onSend,
  onAddSuggestion,
  onClose,
  agentOnline = true,
}: {
  trip: Trip;
  messages: ChatMessage[];
  thinking: boolean;
  onSend: (prompt: string) => void;
  onAddSuggestion: (suggestion: Suggestion) => void;
  onClose?: () => void;
  agentOnline?: boolean;
}) {
  const [value, setValue] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const messageCount = useRef(messages.length);

  useEffect(() => {
    const node = scrollRef.current;
    const grew = messages.length > messageCount.current;
    messageCount.current = messages.length;
    if (!node || !grew) return;
    node.scrollTo({ top: node.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const send = () => {
    const prompt = value.trim();
    if (!prompt || thinking) return;
    setValue("");
    onSend(prompt);
  };

  return (
    <aside className="flex h-full min-h-0 w-full flex-col border-l border-line/70 bg-[#f7f3ea] xl:w-[374px]">
      <div className="flex items-start justify-between border-b border-line/60 px-4 pb-3.5 pt-4">
        <div className="flex items-center gap-2.5">
          <div className="relative grid h-9 w-9 place-items-center rounded-full bg-ink text-paper">
            <Sparkles size={15} />
            <span className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-[#f7f3ea] ${agentOnline ? "bg-[#7b9a6c]" : "bg-sun"}`} />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[12px] font-medium">Wander</span>
              <span className="rounded-full border border-line/80 px-1.5 py-0.5 text-[8px] tracking-[0.06em] text-faint">AGENT</span>
            </div>
            <div className="mt-0.5 flex items-center gap-1 text-[9px] text-muted">
              <CircleDot size={9} className={agentOnline ? "text-moss" : "text-sun"} /> {agentOnline ? "Knows this plan · live" : "Local fallback · agent offline"}
            </div>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="rounded-full p-1.5 text-faint transition hover:bg-paper hover:text-ink xl:hidden" aria-label="Close Wander">
            <X size={16} />
          </button>
        )}
      </div>

      <div className="mx-4 mt-3 flex items-center justify-between rounded-lg border border-line/60 bg-card/55 px-3 py-2 text-[9px] text-muted">
        <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-clay" /> 7 days · {trip.pace.toLowerCase()} pace</span>
        <span className="tabular-nums">{formatYen(trip.budget)} cap</span>
      </div>

      <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
        <div className="space-y-5">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
              {message.role === "user" ? (
                <div className="max-w-[88%] rounded-2xl rounded-br-md bg-ink px-3.5 py-2.5 text-[11.5px] leading-relaxed text-paper">
                  {message.text}
                </div>
              ) : (
                <div className="w-full">
                  <div className="whitespace-pre-wrap text-[11.5px] leading-[1.75] text-[#3e423a]">
                    {message.text}
                  </div>
                  {message.source === "local" && (
                    <div className="mt-1.5 text-[8px] tracking-[0.08em] text-faint">LOCAL FALLBACK — AGENT BRIDGE UNAVAILABLE</div>
                  )}
                  {message.suggestion && (
                    <SuggestionCard
                      suggestion={message.suggestion}
                      trip={trip}
                      onAdd={() => onAddSuggestion(message.suggestion!)}
                    />
                  )}
                </div>
              )}
            </div>
          ))}
          {thinking && (
            <div className="flex items-center gap-2 text-[10px] text-muted">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-ink text-paper">
                <Sparkles size={11} />
              </div>
              <div className="flex items-center gap-1 rounded-full border border-line/80 bg-card/60 px-2.5 py-1.5">
                <span className="typing-dot h-1 w-1 rounded-full bg-muted" />
                <span className="typing-dot h-1 w-1 rounded-full bg-muted" />
                <span className="typing-dot h-1 w-1 rounded-full bg-muted" />
                <span className="ml-1 text-[9px] text-faint">reading your plan…</span>
              </div>
            </div>
          )}

          {messages.length === 1 && !thinking && (
            <div className="mt-6 border-t border-line/65 pt-4">
              <div className="flex items-center gap-1.5 text-[8.5px] font-medium tracking-[0.14em] text-faint">
                <span className="h-px w-3 bg-line" /> WHAT I AM HOLDING ONTO
              </div>
              <div className="mt-3 space-y-3">
                <div className="flex items-start gap-2.5">
                  <ShieldCheck size={13} className="mt-0.5 shrink-0 text-moss" />
                  <div>
                    <div className="text-[10px] font-medium text-ink">The non-negotiables</div>
                    <p className="mt-0.5 text-[9.5px] leading-relaxed text-muted">The tea ceremony, the machiya, and one genuinely empty evening.</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <Clock3 size={13} className="mt-0.5 shrink-0 text-clay" />
                  <div>
                    <div className="text-[10px] font-medium text-ink">The seam to watch</div>
                    <p className="mt-0.5 text-[9.5px] leading-relaxed text-muted">Day 5 ends at 21:00 in Osaka. Day 6 starts at 09:30 for Uji.</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <CloudRain size={13} className="mt-0.5 shrink-0 text-sky" />
                  <div>
                    <div className="text-[10px] font-medium text-ink">The weather window</div>
                    <p className="mt-0.5 text-[9.5px] leading-relaxed text-muted">Wednesday afternoon is the flexible one. Keep a museum up your sleeve.</p>
                  </div>
                </div>
              </div>
              <button
                onClick={() => onSend("What would you protect first if we had to cut the trip in half?")}
                className="mt-3 flex items-center gap-1 text-[9.5px] text-clay transition hover:text-clay/75"
              >
                Ask what I would protect <ChevronRight size={11} />
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="px-4 pb-3">
        <div className="mb-2 flex gap-1.5 overflow-x-auto pb-0.5 no-scrollbar">
          {quickPrompts.slice(0, 3).map((prompt) => (
            <button
              key={prompt}
              onClick={() => onSend(prompt)}
              disabled={thinking}
              className="shrink-0 rounded-full border border-line/80 bg-card/45 px-2.5 py-1.5 text-[9px] text-muted transition hover:border-clay/30 hover:text-clay disabled:opacity-40"
            >
              {prompt}
            </button>
          ))}
        </div>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            send();
          }}
          className="rounded-xl border border-line bg-card p-1.5 shadow-[0_8px_22px_-20px_rgba(30,33,29,.6)] transition focus-within:border-clay/35"
        >
          <textarea
            value={value}
            onChange={(event) => setValue(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                send();
              }
            }}
            rows={2}
            placeholder="Ask about the plan, or change it…"
            className="w-full resize-none bg-transparent px-2 py-1 text-[11.5px] leading-relaxed outline-none placeholder:text-faint"
          />
          <div className="flex items-center justify-between px-1 pb-0.5">
            <span className="text-[8.5px] text-faint">Enter to send · Shift+Enter for a new line</span>
            <button
              type="submit"
              disabled={!value.trim() || thinking}
              className="grid h-7 w-7 place-items-center rounded-lg bg-clay text-white transition hover:bg-[#a95034] disabled:opacity-30"
              aria-label="Send message"
            >
              <ArrowUp size={14} />
            </button>
          </div>
        </form>
        <div className="mt-2 flex items-center justify-center gap-1 text-[8px] text-faint">
          <span className={`h-1 w-1 rounded-full ${agentOnline ? "bg-moss" : "bg-sun"}`} /> {agentOnline ? "Managed Agent · grounded in your itinerary" : "Local fallback · agent unavailable"}
        </div>
      </div>
    </aside>
  );
}

function SuggestionCard({
  suggestion,
  trip,
  onAdd,
}: {
  suggestion: Suggestion;
  trip: Trip;
  onAdd: () => void;
}) {
  const day = trip.days.find((item) => item.id === suggestion.dayId);
  const city = day ? cityMeta[day.city] : null;
  const meta = kindMeta[suggestion.kind];
  return (
    <div className="mt-3 overflow-hidden rounded-xl border border-clay/20 bg-card/80 shadow-[0_1px_0_rgba(255,255,255,.75)_inset]">
      <div className="flex items-center justify-between border-b border-line/60 px-3 py-2">
        <span className="flex items-center gap-1.5 text-[8.5px] font-medium tracking-[0.12em] text-clay"><Sparkles size={10} /> PROPOSED BLOCK</span>
        <span className="text-[8.5px] text-faint">Day {suggestion.dayId} · {city?.name}</span>
      </div>
      <div className="px-3 py-3">
        <div className="flex items-start gap-2.5">
          <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full" style={{ color: meta.tone, background: meta.soft }}>
            <KindIcon kind={suggestion.kind} size={13} />
          </div>
          <div className="min-w-0">
            <h4 className="text-[12px] font-medium leading-snug text-ink">{suggestion.title}</h4>
            <p className="mt-0.5 text-[9.5px] text-muted">{suggestion.place}</p>
            <p className="mt-1 text-[9px] text-faint">{suggestion.start} · {suggestion.duration} min · {suggestion.cost ? formatYen(suggestion.cost) : "free"}</p>
          </div>
        </div>
        <p className="mt-2 text-[9.5px] leading-relaxed text-muted">{suggestion.note}</p>
        <button
          onClick={onAdd}
          className="mt-3 flex w-full items-center justify-between rounded-lg border border-line bg-paper/45 px-2.5 py-2 text-[10px] text-ink transition hover:border-clay/30 hover:bg-clay-soft/40"
        >
          <span className="flex items-center gap-1.5"><Plus size={11} /> Add to Day {suggestion.dayId}</span>
          <ChevronRight size={12} className="text-faint" />
        </button>
      </div>
    </div>
  );
}
