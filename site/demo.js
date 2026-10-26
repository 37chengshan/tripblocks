/* TripBlocks demo workbench — local graph editing, read-only saved conversations. */
(() => {
  "use strict";

  const STORE_KEY = "tripblocks:demo:v1";
  const STAGE_MIN_W = 1380;
  const STAGE_MIN_H = 840;
  const SIZES = {
    root: { w: 230, h: 110 },
    day: { w: 200, h: 72 },
    block: { w: 168, h: 72 },
  };

  const KIND = {
    travel: { label: "Move" },
    stay: { label: "Stay" },
    explore: { label: "Explore" },
    food: { label: "Taste" },
    reset: { label: "Breathe" },
  };

  const seedDays = [
    { id: 1, label: "Fri", date: "06", month: "NOV", city: "kyoto", title: "Land & exhale" },
    { id: 2, label: "Sat", date: "07", month: "NOV", city: "kyoto", title: "East Kyoto" },
    { id: 3, label: "Sun", date: "08", month: "NOV", city: "kyoto", title: "Arashiyama" },
    { id: 4, label: "Mon", date: "09", month: "NOV", city: "nara", title: "Nara day" },
    { id: 5, label: "Tue", date: "10", month: "NOV", city: "osaka", title: "Osaka, late" },
    { id: 6, label: "Wed", date: "11", month: "NOV", city: "uji", title: "Tea country" },
    { id: 7, label: "Thu", date: "12", month: "NOV", city: "kyoto", title: "Slow goodbye" },
  ];

  const seedBlocks = [
    { id: "b1", dayId: 1, kind: "travel", title: "Haruka to Kyoto", place: "Kansai Airport → Kyoto Station", start: "09:40", duration: 75, cost: 2400, note: "Reserved seats, car 4" },
    { id: "b2", dayId: 1, kind: "stay", title: "Machiya check-in", place: "Gion, Kyoto", start: "11:30", duration: 60, cost: 96000, note: "Six nights · luggage drop first" },
    { id: "b3", dayId: 1, kind: "food", title: "Nishiki market crawl", place: "Nishiki Market", start: "13:30", duration: 120, cost: 5200, note: "Go hungry. Cash is useful." },
    { id: "b4", dayId: 1, kind: "explore", title: "Pontocho at dusk", place: "Pontocho Alley", start: "18:30", duration: 90, cost: 3500, note: "No reservations — walk until something feels right." },
    { id: "b5", dayId: 2, kind: "explore", title: "Fushimi Inari before crowds", place: "Fushimi Inari Taisha", start: "07:30", duration: 180, cost: 0, note: "Take the side path back down." },
    { id: "b6", dayId: 2, kind: "food", title: "Udon at Okakura", place: "Higashiyama", start: "11:30", duration: 60, cost: 2400, note: "Small shop, short menu." },
    { id: "b7", dayId: 2, kind: "explore", title: "Tea ceremony", place: "Higashiyama", start: "14:00", duration: 90, cost: 6000, note: "Booked under Chen · 2 guests" },
    { id: "b8", dayId: 2, kind: "food", title: "Kaiseki dinner", place: "Gion Karyo", start: "19:00", duration: 120, cost: 18000, note: "The splurge. Go slowly." },
    { id: "b9", dayId: 3, kind: "explore", title: "Bamboo grove, early", place: "Arashiyama", start: "09:00", duration: 90, cost: 0, note: "Before 9:30 it is still quiet." },
    { id: "b10", dayId: 3, kind: "food", title: "Riverside soba", place: "Katsura River", start: "11:30", duration: 60, cost: 2800, note: "Window seat if you can." },
    { id: "b11", dayId: 3, kind: "explore", title: "Monkey park + Okochi Sanso", place: "Arashiyama", start: "14:00", duration: 150, cost: 2200, note: "Wear shoes with grip." },
    { id: "b12", dayId: 3, kind: "reset", title: "Free evening", place: "Kyoto", start: "18:00", duration: 120, cost: 0, note: "Nothing scheduled. Protect this." },
    { id: "b13", dayId: 4, kind: "travel", title: "Kintetsu to Nara", place: "Kyoto → Nara", start: "08:30", duration: 45, cost: 1600, note: "Rapid express, 2 stops." },
    { id: "b14", dayId: 4, kind: "explore", title: "Nara deer park", place: "Nara Park", start: "10:00", duration: 120, cost: 0, note: "Buy crackers once, not three times." },
    { id: "b15", dayId: 4, kind: "food", title: "Todai-ji & lunch", place: "Nara", start: "12:30", duration: 150, cost: 3200, note: "Try the kakinoha sushi." },
    { id: "b16", dayId: 4, kind: "travel", title: "Back to Kyoto", place: "Nara → Kyoto", start: "17:30", duration: 50, cost: 1600, note: "Beat the commuter rush." },
    { id: "b17", dayId: 5, kind: "travel", title: "Limited express to Osaka", place: "Kyoto → Osaka", start: "09:30", duration: 55, cost: 2200, note: "Breakfast at the station." },
    { id: "b18", dayId: 5, kind: "food", title: "Kuromon market", place: "Nihonbashi, Osaka", start: "11:30", duration: 90, cost: 4800, note: "Split everything." },
    { id: "b19", dayId: 5, kind: "explore", title: "Osaka Castle", place: "Osaka Castle Park", start: "14:00", duration: 120, cost: 1200, note: "The park is free; the keep is optional." },
    { id: "b20", dayId: 5, kind: "food", title: "Dotonbori after dark", place: "Dotonbori", start: "18:30", duration: 150, cost: 7600, note: "Late train back is fine." },
    { id: "b21", dayId: 6, kind: "travel", title: "Uji by local train", place: "Kyoto → Uji", start: "09:30", duration: 35, cost: 800, note: "South exit, then walk." },
    { id: "b22", dayId: 6, kind: "explore", title: "Byodo-in & tea street", place: "Uji", start: "10:30", duration: 180, cost: 2400, note: "Matcha before noon." },
    { id: "b23", dayId: 6, kind: "reset", title: "Slow afternoon", place: "Uji riverside", start: "15:00", duration: 120, cost: 0, note: "Leave room for a nap." },
    { id: "b24", dayId: 7, kind: "explore", title: "Last-minute Kyoto gifts", place: "Teramachi", start: "10:00", duration: 120, cost: 5000, note: "Don't buy the first thing." },
    { id: "b25", dayId: 7, kind: "travel", title: "Haruka to KIX", place: "Kyoto → Kansai Airport", start: "13:00", duration: 75, cost: 2400, note: "Allow 2h before the flight." },
  ];

  const conversations = [
    {
      id: "day-five",
      title: "Make Day 5 lighter",
      date: "24 Oct · 21:18",
      source: "Managed Agent",
      prompt: "Make Day 5 lighter. Keep the market and Dotonbori, but I don't want to arrive in Uji exhausted.",
      reply: "Day 5 is doing three things in one day: Kuromon, Osaka Castle, and Dotonbori at night. Keep Kuromon and make the castle optional — the park is free and still worth the walk. Turn the evening into one standing counter instead of a full dinner. That buys you about two hours and protects the Uji morning.",
      suggestion: { title: "One standing counter, no reservations", meta: "Day 05 · 19:00 · 60 min · ¥3,200" },
    },
    {
      id: "rain",
      title: "A rain plan for Arashiyama",
      date: "23 Oct · 09:42",
      source: "Managed Agent",
      prompt: "It looks wet on Day 3. What moves first if the bamboo grove is a washout?",
      reply: "Move the monkey park, not the bamboo grove. The grove is still atmospheric in light rain; the monkeys are the exposed part. Swap the 14:00 block for the Kyoto National Museum indoors, then take the earliest possible grove slot on Day 7 before the airport. Keep the free evening exactly where it is.",
      suggestion: { title: "Indoor plan B: Kyoto National Museum", meta: "Day 03 · 14:00 · 90 min · ¥1,400" },
    },
    {
      id: "budget",
      title: "Cut ¥30,000 without losing tea",
      date: "22 Oct · 18:05",
      source: "Local draft",
      prompt: "Trim about ¥30,000 from the week. Do not touch the tea ceremony or the Nishiki morning.",
      reply: "The kaiseki on Day 2 is the cleanest cut: a long lunch at a neighbourhood counter keeps the day's shape and saves roughly ¥13,000. Taking the local train to Uji instead of the express saves little, so leave it. The other lever is the Osaka hotel night — one night in a simpler room saves the rest without changing the route.",
      suggestion: { title: "Long lunch instead of kaiseki", meta: "Day 02 · 13:00 · 90 min · ¥4,800" },
    },
  ];

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  const stage = $("#graphStage");
  const viewport = $("#graphViewport");
  const edgesSvg = $("#graphEdges");
  const zoomLabel = $("#zoomLabel");
  const toastEl = $("#toast");
  const editorBackdrop = $("#editorBackdrop");
  const blockForm = $("#blockForm");

  let state = null;
  let stageW = STAGE_MIN_W;
  let stageH = STAGE_MIN_H;
  let scale = 1;
  let panX = 0;
  let panY = 0;
  let selectedId = null;
  let editingId = null;
  let activeConversation = 0;
  let toastTimer = 0;
  let hasFitted = false;

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function formatYen(value) {
    return `¥${Math.round(Number(value) || 0).toLocaleString("en-US")}`;
  }

  function esc(value) {
    return String(value ?? "").replace(/[&<>"']/g, (char) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    }[char]));
  }

  function parseTrip() {
    const days = seedDays.map((day, index) => ({
      ...day,
      x: 340,
      y: 48 + index * 108,
      w: SIZES.day.w,
      h: SIZES.day.h,
    }));
    const perDay = new Map();
    const blocks = seedBlocks.map((block) => {
      const index = perDay.get(block.dayId) || 0;
      perDay.set(block.dayId, index + 1);
      const day = days[block.dayId - 1];
      return {
        ...block,
        x: 640 + index * 176,
        y: day.y,
        w: SIZES.block.w,
        h: SIZES.block.h,
      };
    });
    return {
      days,
      blocks,
      root: { x: 40, y: 330, w: SIZES.root.w, h: SIZES.root.h },
    };
  }

  function seedState() {
    const trip = parseTrip();
    return { version: 1, days: trip.days, blocks: trip.blocks, root: trip.root };
  }

  function loadState() {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (!raw) return seedState();
      const parsed = JSON.parse(raw);
      if (!parsed || !Array.isArray(parsed.days) || !Array.isArray(parsed.blocks)) return seedState();
      if (parsed.days.length !== 7) return seedState();
      // Keep the itinerary honest even if a previous demo stored a partial graph.
      const days = parsed.days.map((day) => {
        const seed = seedDays.find((item) => item.id === day.id) || seedDays[0];
        return {
          ...seed,
          x: Number.isFinite(day.x) ? day.x : 340,
          y: Number.isFinite(day.y) ? day.y : 48 + (seed.id - 1) * 108,
          w: SIZES.day.w,
          h: SIZES.day.h,
        };
      });
      const blocks = parsed.blocks
        .filter((block) => block && block.id && block.dayId)
        .map((block, index) => {
          const day = days.find((item) => item.id === Number(block.dayId)) || days[0];
          const fallback = 640 + (index % 4) * 176;
          return {
            id: String(block.id),
            dayId: Number(block.dayId),
            kind: KIND[block.kind] ? block.kind : "explore",
            title: String(block.title || "Untitled block").slice(0, 80),
            place: String(block.place || "").slice(0, 100),
            start: /^\d{2}:\d{2}$/.test(block.start) ? block.start : "10:00",
            duration: clamp(Number(block.duration) || 60, 15, 600),
            cost: Math.max(0, Number(block.cost) || 0),
            note: String(block.note || "").slice(0, 240),
            x: Number.isFinite(block.x) ? block.x : fallback,
            y: Number.isFinite(block.y) ? block.y : day.y,
            w: SIZES.block.w,
            h: SIZES.block.h,
          };
        });
      return { version: 1, days, blocks, root: { x: 40, y: 330, w: SIZES.root.w, h: SIZES.root.h } };
    } catch {
      return seedState();
    }
  }

  function saveState() {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(state));
    } catch {
      // The graph still works for this session when storage is unavailable.
    }
  }

  function showToast(message) {
    window.clearTimeout(toastTimer);
    toastEl.textContent = message;
    toastEl.classList.add("is-visible");
    toastTimer = window.setTimeout(() => toastEl.classList.remove("is-visible"), 2400);
  }

  function applyTransform() {
    stage.style.transform = `translate3d(${panX}px, ${panY}px, 0) scale(${scale})`;
    zoomLabel.textContent = `${Math.round(scale * 100)}%`;
  }

  function stagePoint(event) {
    const rect = viewport.getBoundingClientRect();
    return {
      x: (event.clientX - rect.left - panX) / scale,
      y: (event.clientY - rect.top - panY) / scale,
    };
  }

  function updateStageSize() {
    let maxX = STAGE_MIN_W;
    let maxY = STAGE_MIN_H;
    for (const node of [state.root, ...state.days, ...state.blocks]) {
      maxX = Math.max(maxX, node.x + node.w + 44);
      maxY = Math.max(maxY, node.y + node.h + 44);
    }
    stageW = Math.ceil(maxX);
    stageH = Math.ceil(maxY);
    stage.style.width = `${stageW}px`;
    stage.style.height = `${stageH}px`;
  }

  function fitGraph() {
    updateStageSize();
    const rect = viewport.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const padding = 42;
    scale = clamp(Math.min((rect.width - padding) / stageW, (rect.height - padding) / stageH), 0.34, 1.12);
    panX = (rect.width - stageW * scale) / 2;
    panY = (rect.height - stageH * scale) / 2;
    applyTransform();
    hasFitted = true;
  }

  function zoomAt(factor, clientX, clientY) {
    const rect = viewport.getBoundingClientRect();
    const mx = clientX === undefined ? rect.width / 2 : clientX - rect.left;
    const my = clientY === undefined ? rect.height / 2 : clientY - rect.top;
    const next = clamp(scale * factor, 0.3, 1.9);
    if (next === scale) return;
    panX = mx - (mx - panX) * (next / scale);
    panY = my - (my - panY) * (next / scale);
    scale = next;
    applyTransform();
  }

  function nodePosition(node) {
    return `translate3d(${node.x}px, ${node.y}px, 0)`;
  }

  function dayCost(dayId) {
    return state.blocks.filter((block) => block.dayId === dayId).reduce((sum, block) => sum + Number(block.cost || 0), 0);
  }

  function dayCount(dayId) {
    return state.blocks.filter((block) => block.dayId === dayId).length;
  }

  function createEdge(d, extraClass = "") {
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", d);
    if (extraClass) path.setAttribute("class", extraClass);
    edgesSvg.appendChild(path);
  }

  function edgeBetween(from, to, extraClass = "") {
    const fromRight = from.x + from.w;
    const fromCenterY = from.y + from.h / 2;
    const toCenterY = to.y + to.h / 2;
    const forward = to.x >= from.x;
    const startX = forward ? fromRight : from.x;
    const endX = forward ? to.x : to.x + to.w;
    const bend = Math.max(58, Math.abs(endX - startX) * 0.48);
    const c1 = forward ? startX + bend : startX - bend;
    const c2 = forward ? endX - bend : endX + bend;
    return `M ${startX} ${fromCenterY} C ${c1} ${fromCenterY}, ${c2} ${toCenterY}, ${endX} ${toCenterY}`;
  }

  function renderEdges() {
    edgesSvg.replaceChildren();
    const selected = state.blocks.find((block) => block.id === selectedId);
    for (const day of state.days) {
      createEdge(edgeBetween(state.root, day), selected && selected.dayId === day.id ? "edge--root edge--active" : "edge--root");
      for (const block of state.blocks.filter((item) => item.dayId === day.id)) {
        createEdge(edgeBetween(day, block), block.id === selectedId ? "edge--day edge--active" : "edge--day");
      }
    }
  }

  function nodeShell(className, node, label) {
    const element = document.createElement("div");
    element.className = `node ${className}`;
    element.style.transform = nodePosition(node);
    element.style.width = `${node.w}px`;
    element.style.height = `${node.h}px`;
    element.dataset.id = label;
    if (label === selectedId) element.classList.add("is-selected");
    return element;
  }

  function bindNode(element, node, onOpen) {
    let drag = null;
    element.addEventListener("pointerdown", (event) => {
      if (event.button !== 0 || event.target.closest("button")) return;
      event.preventDefault();
      const point = stagePoint(event);
      drag = {
        pointerId: event.pointerId,
        startX: point.x,
        startY: point.y,
        originX: node.x,
        originY: node.y,
        moved: false,
      };
      element.setPointerCapture(event.pointerId);
      element.classList.add("is-dragging");
      selectedId = node.id === "root" ? selectedId : node.id;
    });
    element.addEventListener("pointermove", (event) => {
      if (!drag || event.pointerId !== drag.pointerId) return;
      const point = stagePoint(event);
      const dx = point.x - drag.startX;
      const dy = point.y - drag.startY;
      if (!drag.moved && Math.abs(dx) + Math.abs(dy) > 4) drag.moved = true;
      if (!drag.moved) return;
      node.x = clamp(drag.originX + dx, 0, stageW - node.w);
      node.y = clamp(drag.originY + dy, 0, stageH - node.h);
      element.style.transform = nodePosition(node);
      renderEdges();
    });
    const end = (event) => {
      if (!drag || (event.pointerId !== undefined && event.pointerId !== drag.pointerId)) return;
      const moved = drag.moved;
      drag = null;
      element.classList.remove("is-dragging");
      if (element.hasPointerCapture?.(event.pointerId)) element.releasePointerCapture(event.pointerId);
      if (!moved) {
        onOpen();
      } else {
        updateStageSize();
        saveState();
      }
    };
    element.addEventListener("pointerup", end);
    element.addEventListener("pointercancel", end);
    element.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        onOpen();
      }
    });
  }

  function renderNodes() {
    stage.querySelectorAll(".node").forEach((node) => node.remove());

    const root = document.createElement("div");
    root.className = "node node--root";
    root.style.transform = nodePosition(state.root);
    root.style.width = `${state.root.w}px`;
    root.style.height = `${state.root.h}px`;
    root.innerHTML = `
      <span class="root-kicker">Root / trip</span>
      <div class="root-title">A slower week<br>in Kansai</div>
      <div class="root-meta"><span>7 days</span><span>${state.blocks.length} blocks</span><span>${formatYen(260000)}</span></div>
    `;
    stage.appendChild(root);

    for (const day of state.days) {
      const element = nodeShell("node--day", day, `day-${day.id}`);
      element.tabIndex = 0;
      element.setAttribute("role", "button");
      element.setAttribute("aria-label", `Day ${day.id}, ${day.title}. ${dayCount(day.id)} blocks. Press Enter to add a block.`);
      element.innerHTML = `
        <button type="button" class="day-add" aria-label="Add a block to Day ${day.id}">+</button>
        <div class="day-top"><span>Day 0${day.id} / ${day.label} ${day.date}</span><span>${day.city}</span></div>
        <div class="day-title">${day.title}</div>
        <div class="day-meta"><span>${dayCount(day.id)} blocks</span><span>${formatYen(dayCost(day.id))}</span></div>
      `;
      const add = $(".day-add", element);
      add.addEventListener("pointerdown", (event) => event.stopPropagation());
      add.addEventListener("click", (event) => {
        event.stopPropagation();
        openEditor(null, day.id);
      });
      bindNode(element, day, () => openEditor(null, day.id));
      stage.appendChild(element);
    }

    const ordered = [...state.blocks].sort((a, b) => a.dayId - b.dayId || a.start.localeCompare(b.start));
    for (const block of ordered) {
      const element = nodeShell("node--block", block, block.id);
      element.dataset.kind = block.kind;
      element.tabIndex = 0;
      element.setAttribute("role", "button");
      element.setAttribute("aria-label", `${block.title}, Day ${block.dayId}, ${block.start}, ${formatYen(block.cost)}. Press Enter to edit.`);
      const kind = KIND[block.kind] || KIND.explore;
      element.innerHTML = `
        <div class="block-top"><span class="block-kind">${kind.label}</span><span>${block.start}</span></div>
        <div class="block-title">${block.title}</div>
        <div class="block-foot"><span>${block.place || "Place TBD"}</span><span>${formatYen(block.cost)}</span></div>
      `;
      element.title = `${block.title}\n${block.start} · ${block.duration} min\n${block.place}${block.note ? `\n${block.note}` : ""}`;
      bindNode(element, block, () => openEditor(block.id));
      stage.appendChild(element);
    }

    renderEdges();
  }

  function render() {
    renderNodes();
    updateStageSize();
    if (!hasFitted) requestAnimationFrame(fitGraph);
  }

  function renderDayOptions(selectedDay) {
    const select = $("#fieldDay");
    select.replaceChildren();
    for (const day of state.days) {
      const option = document.createElement("option");
      option.value = String(day.id);
      option.textContent = `Day 0${day.id} · ${day.label} ${day.date} — ${day.title}`;
      if (day.id === Number(selectedDay)) option.selected = true;
      select.appendChild(option);
    }
  }

  function openEditor(blockId, presetDay = 1) {
    editingId = blockId;
    const block = blockId ? state.blocks.find((item) => item.id === blockId) : null;
    const dayId = block ? block.dayId : presetDay;
    renderDayOptions(dayId);
    $("#editorEyebrow").textContent = block ? "Edit block / local demo" : "New block / local demo";
    $("#editorTitle").textContent = block ? block.title : "Add a block";
    $("#fieldTitle").value = block ? block.title : "";
    $("#fieldKind").value = block ? block.kind : "explore";
    $("#fieldStart").value = block ? block.start : "10:00";
    $("#fieldDuration").value = block ? block.duration : 60;
    $("#fieldCost").value = block ? block.cost : 0;
    $("#fieldPlace").value = block ? block.place : "";
    $("#fieldNote").value = block ? block.note : "";
    $("#deleteBlock").hidden = !block;
    editorBackdrop.hidden = false;
    document.body.classList.add("editor-open");
    window.requestAnimationFrame(() => $("#fieldTitle").focus());
  }

  function closeEditor() {
    editorBackdrop.hidden = true;
    document.body.classList.remove("editor-open");
    editingId = null;
    blockForm.reset();
  }

  function nextPosition(dayId) {
    const day = state.days.find((item) => item.id === Number(dayId)) || state.days[0];
    const count = dayCount(day.id);
    return { x: day.x + 300 + count * 176, y: day.y };
  }

  blockForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const form = new FormData(blockForm);
    const title = String(form.get("title") || "").trim();
    if (!title) {
      $("#fieldTitle").focus();
      return;
    }
    const dayId = Number(form.get("dayId"));
    const payload = {
      title: title.slice(0, 80),
      dayId,
      kind: KIND[String(form.get("kind"))] ? String(form.get("kind")) : "explore",
      start: String(form.get("start") || "10:00"),
      duration: clamp(Number(form.get("duration")) || 60, 15, 600),
      cost: Math.max(0, Number(form.get("cost")) || 0),
      place: String(form.get("place") || "").trim().slice(0, 100),
      note: String(form.get("note") || "").trim().slice(0, 240),
    };

    if (editingId) {
      const block = state.blocks.find((item) => item.id === editingId);
      if (!block) return;
      const dayChanged = block.dayId !== dayId;
      Object.assign(block, payload);
      if (dayChanged) {
        const pos = nextPosition(dayId);
        block.x = pos.x;
        block.y = pos.y;
      }
      showToast("Block updated · saved locally");
    } else {
      const pos = nextPosition(dayId);
      state.blocks.push({
        id: `demo-${Date.now()}`,
        ...payload,
        x: pos.x,
        y: pos.y,
        w: SIZES.block.w,
        h: SIZES.block.h,
      });
      showToast("Block added · saved locally");
    }

    selectedId = editingId;
    closeEditor();
    render();
    saveState();
  });

  $("#deleteBlock").addEventListener("click", () => {
    if (!editingId) return;
    const block = state.blocks.find((item) => item.id === editingId);
    if (!block) return;
    state.blocks = state.blocks.filter((item) => item.id !== editingId);
    selectedId = null;
    closeEditor();
    render();
    saveState();
    showToast(`Removed “${block.title}” · saved locally`);
  });

  $("#editorClose").addEventListener("click", closeEditor);
  $("#editorCancel").addEventListener("click", closeEditor);
  editorBackdrop.addEventListener("pointerdown", (event) => {
    if (event.target === editorBackdrop) closeEditor();
  });

  $("#addBlock").addEventListener("click", () => openEditor(null, 1));
  $("#fitGraph").addEventListener("click", () => {
    fitGraph();
    showToast("Graph recentred");
  });
  $("#zoomIn").addEventListener("click", () => zoomAt(1.12));
  $("#zoomOut").addEventListener("click", () => zoomAt(1 / 1.12));
  $("#resetGraph").addEventListener("click", () => {
    state = seedState();
    selectedId = null;
    hasFitted = false;
    try {
      localStorage.removeItem(STORE_KEY);
    } catch {
      // Ignore storage failures; reset is still visible in this session.
    }
    render();
    requestAnimationFrame(fitGraph);
    showToast("Demo graph reset");
  });

  viewport.addEventListener(
    "wheel",
    (event) => {
      event.preventDefault();
      zoomAt(event.deltaY < 0 ? 1.1 : 1 / 1.1, event.clientX, event.clientY);
    },
    { passive: false },
  );

  let pan = null;
  viewport.addEventListener("pointerdown", (event) => {
    if (event.button !== 0 || event.target.closest(".node")) return;
    pan = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: panX,
      originY: panY,
    };
    viewport.setPointerCapture(event.pointerId);
  });
  viewport.addEventListener("pointermove", (event) => {
    if (!pan || event.pointerId !== pan.pointerId) return;
    panX = pan.originX + (event.clientX - pan.startX);
    panY = pan.originY + (event.clientY - pan.startY);
    applyTransform();
  });
  const endPan = (event) => {
    if (!pan) return;
    if (event.pointerId !== undefined && event.pointerId !== pan.pointerId) return;
    pan = null;
    if (viewport.hasPointerCapture?.(event.pointerId)) viewport.releasePointerCapture(event.pointerId);
  };
  viewport.addEventListener("pointerup", endPan);
  viewport.addEventListener("pointercancel", endPan);

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !editorBackdrop.hidden) closeEditor();
  });

  let resizeTimer = 0;
  window.addEventListener("resize", () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => {
      if (!editorBackdrop.hidden) return;
      fitGraph();
    }, 180);
  });

  function renderConversations() {
    const list = $("#convList");
    list.replaceChildren();
    conversations.forEach((conv, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = `conv-item${index === activeConversation ? " is-active" : ""}`;
      button.setAttribute("role", "tab");
      button.setAttribute("aria-selected", String(index === activeConversation));
      button.innerHTML = `
        <div class="conv-item-top"><span>${conv.date}</span><span>${conv.source}</span></div>
        <strong>${conv.title}</strong>
        <p>${conv.prompt}</p>
      `;
      button.addEventListener("click", () => {
        activeConversation = index;
        renderConversations();
        renderTranscript();
      });
      list.appendChild(button);
    });
  }

  function messageElement(role, text, meta) {
    const wrap = document.createElement("div");
    wrap.className = `message message--${role}`;
    const label = document.createElement("div");
    label.className = "message-label";
    const left = document.createElement("span");
    left.textContent = role === "user" ? "Traveller" : "Wander / managed agent";
    const right = document.createElement("span");
    right.textContent = meta || "";
    label.append(left, right);
    const body = document.createElement("div");
    body.className = "message-body";
    body.textContent = text;
    wrap.append(label, body);
    return wrap;
  }

  function renderTranscript() {
    const conv = conversations[activeConversation];
    const root = $("#convTranscript");
    root.replaceChildren();

    const head = document.createElement("div");
    head.className = "transcript-head";
    head.innerHTML = `
      <div><span>Saved ${conv.date}</span><strong>${conv.title}</strong></div>
      <span class="source-tag">${conv.source}</span>
    `;
    root.appendChild(head);
    root.appendChild(messageElement("user", conv.prompt, "you"));
    const agent = messageElement("agent", conv.reply, conv.source === "Managed Agent" ? "grounded" : "no model");
    if (conv.suggestion) {
      const card = document.createElement("div");
      card.className = "suggestion";
      card.innerHTML = `
        <span class="suggestion-label">Suggested block · not applied</span>
        <strong>${conv.suggestion.title}</strong>
        <span>${conv.suggestion.meta}</span>
      `;
      agent.appendChild(card);
    }
    root.appendChild(agent);

    const note = document.createElement("p");
    note.className = "readonly-line";
    note.textContent = "Read-only record · this demo has no composer and calls no model.";
    root.appendChild(note);
  }

  // Init.
  state = loadState();
  render();
  renderConversations();
  renderTranscript();
  requestAnimationFrame(fitGraph);

  window.__tripblocksDemo = {
    reset: () => $("#resetGraph").click(),
    getState: () => JSON.parse(JSON.stringify(state)),
    fit: fitGraph,
  };
})();
