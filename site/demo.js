/* TripBlocks demo workbench — one saved conversation per trip tree. */
(() => {
  "use strict";

  const STORE_KEY = "tripblocks:demo:sessions:v2";
  const STAGE_MIN_W = 786;
  const STAGE_MIN_H = 690;
  const ROOT = { x: 14, y: 14 };
  const DAY_X = 14;
  const DAY_Y = 136;
  const DAY_PITCH = 106;
  const BLOCK_Y0 = 238;
  const BLOCK_PITCH = 98;
  const SIZES = {
    root: { w: 150, h: 92 },
    day: { w: 96, h: 70 },
    block: { w: 96, h: 84 },
  };
  const BUDGET = 260000;

  const KIND = {
    travel: { label: "Move" },
    stay: { label: "Stay" },
    explore: { label: "Explore" },
    food: { label: "Taste" },
    reset: { label: "Breathe" },
  };

  const TRIP = {
    name: "Kansai, slowly",
    when: "06 — 12 Nov 2026",
    where: "Kyoto · Nara · Osaka · Uji",
    budget: BUDGET,
  };

  const BASE_DAYS = [
    { id: 1, label: "Fri", date: "06", month: "NOV", city: "kyoto", title: "Land & rest" },
    { id: 2, label: "Sat", date: "07", month: "NOV", city: "kyoto", title: "East Kyoto" },
    { id: 3, label: "Sun", date: "08", month: "NOV", city: "kyoto", title: "Arashiyama" },
    { id: 4, label: "Mon", date: "09", month: "NOV", city: "nara", title: "Nara day" },
    { id: 5, label: "Tue", date: "10", month: "NOV", city: "osaka", title: "Osaka, late" },
    { id: 6, label: "Wed", date: "11", month: "NOV", city: "uji", title: "Tea country" },
    { id: 7, label: "Thu", date: "12", month: "NOV", city: "kyoto", title: "Goodbye" },
  ];

  const block = (id, dayId, kind, title, place, start, duration, cost, note) => ({
    id, dayId, kind, title, place, start, duration, cost, note,
  });

  const sessionSeeds = [
    {
      id: "day-five",
      index: 1,
      title: "Make Day 5 lighter",
      date: "24 Oct · 21:18",
      source: "Managed Agent",
      summary: "Day 5 shortened to three stops; Osaka ends before 21:00 and the Uji morning stays intact.",
      rootTitle: "A slower week in Kansai",
      rootKicker: "Draft 01 / Day 05",
      dayOverrides: {},
      blocks: [
        block("s1-1", 1, "travel", "Haruka to Kyoto", "Kansai Airport → Kyoto Station", "09:40", 75, 2400, "Reserved seats, car 4"),
        block("s1-2", 1, "stay", "Machiya check-in", "Gion, Kyoto", "11:30", 60, 96000, "Six nights · luggage drop first"),
        block("s1-3", 1, "food", "Nishiki market crawl", "Nishiki Market", "13:30", 120, 5200, "Go hungry. Cash is useful."),
        block("s1-4", 1, "explore", "Pontocho at dusk", "Pontocho Alley", "18:30", 90, 3500, "No reservations — walk until something feels right."),
        block("s1-5", 2, "explore", "Fushimi Inari before crowds", "Fushimi Inari Taisha", "07:30", 180, 0, "Take the side path back down."),
        block("s1-6", 2, "food", "Udon at Okakura", "Higashiyama", "11:30", 60, 2400, "Small shop, short menu."),
        block("s1-7", 2, "explore", "Tea ceremony", "Higashiyama", "14:00", 90, 6000, "Booked under Chen · 2 guests"),
        block("s1-8", 2, "food", "Kaiseki dinner", "Gion Karyo", "19:00", 120, 18000, "The splurge. Go slowly."),
        block("s1-9", 3, "explore", "Bamboo grove, early", "Arashiyama", "09:00", 90, 0, "Before 09:30 it is still quiet."),
        block("s1-10", 3, "food", "Riverside soba", "Katsura River", "11:30", 60, 2800, "Window seat if you can."),
        block("s1-11", 3, "explore", "Monkey park + Okochi Sanso", "Arashiyama", "14:00", 150, 2200, "Wear shoes with grip."),
        block("s1-12", 3, "reset", "Free evening", "Kyoto", "18:00", 120, 0, "Nothing scheduled. Protect this."),
        block("s1-13", 4, "travel", "Kintetsu to Nara", "Kyoto → Nara", "08:30", 45, 1600, "Rapid express, 2 stops."),
        block("s1-14", 4, "explore", "Nara deer park", "Nara Park", "10:00", 120, 0, "Buy crackers once, not three times."),
        block("s1-15", 4, "food", "Todai-ji & lunch", "Nara", "12:30", 150, 3200, "Try the kakinoha sushi."),
        block("s1-16", 4, "travel", "Back to Kyoto", "Nara → Kyoto", "17:30", 50, 1600, "Beat the commuter rush."),
        block("s1-17", 5, "travel", "Limited express to Osaka", "Kyoto → Osaka", "09:30", 55, 2200, "Breakfast at the station."),
        block("s1-18", 5, "food", "Kuromon market, grazing", "Nihonbashi, Osaka", "11:30", 90, 4800, "Split everything."),
        block("s1-19", 5, "reset", "Standing counter, Dotonbori", "Dotonbori", "18:30", 75, 3200, "One counter, no reservations. Castle skipped."),
        block("s1-20", 6, "travel", "Uji by local train", "Kyoto → Uji", "09:30", 35, 800, "South exit, then walk."),
        block("s1-21", 6, "explore", "Byodo-in & tea street", "Uji", "10:30", 180, 2400, "Matcha before noon."),
        block("s1-22", 6, "reset", "Slow afternoon", "Uji riverside", "15:00", 120, 0, "Leave room for a nap."),
        block("s1-23", 7, "explore", "Last-minute Kyoto gifts", "Teramachi", "10:00", 120, 5000, "Don't buy the first thing."),
        block("s1-24", 7, "travel", "Haruka to KIX", "Kyoto → Kansai Airport", "13:00", 75, 2400, "Allow 2h before the flight."),
      ],
      messages: [
        {
          role: "user",
          text: "Make Day 5 lighter. Keep the market and Dotonbori, but I don't want to arrive in Uji exhausted.",
          meta: "you · saved",
        },
        {
          role: "agent",
          text: "Day 5 is doing three things in one day: Kuromon, Osaka Castle, and Dotonbori at night. Keep Kuromon and make the castle optional — the park is free and still worth the walk. Turn the evening into one standing counter instead of a full dinner. That buys you about two hours and protects the Uji morning.",
          meta: "grounded · managed agent",
        },
      ],
      suggestion: {
        label: "Applied to this draft",
        title: "One standing counter, no reservations",
        meta: "Day 05 · 18:30 · 75 min · ¥3,200",
      },
      usage: {
        model: "Sonnet 4.5",
        tokens: "14,290",
        tokenDetail: "11.8k in · 2.5k out",
        cost: "$0.18",
        context: "18%",
        contextDetail: "36k / 200k window",
        runtime: "42s",
      },
      thinking: [
        { state: "done", title: "Read the Day 5 chain and the Uji morning constraint", meta: "4s" },
        { state: "done", title: "Compared three ways to lighten Osaka", meta: "11s" },
        { state: "done", title: "Chose Kuromon plus one standing counter", meta: "19s" },
        { state: "active", title: "Cleared the castle and full dinner from the draft", meta: "42s" },
      ],
    },
    {
      id: "rain",
      index: 2,
      title: "Rainy-day Arashiyama",
      date: "23 Oct · 09:42",
      source: "Managed Agent",
      summary: "Day 3 rebuilt around a wet forecast; the museum moves indoors and the grove gets a Day 7 second chance.",
      rootTitle: "A slower week in Kansai",
      rootKicker: "Draft 02 / Rain plan",
      dayOverrides: {
        3: "Arashiyama",
        7: "Goodbye",
      },
      blocks: [
        block("s2-1", 1, "travel", "Haruka to Kyoto", "Kansai Airport → Kyoto Station", "09:40", 75, 2400, "Reserved seats, car 4"),
        block("s2-2", 1, "stay", "Machiya check-in", "Gion, Kyoto", "11:30", 60, 96000, "Six nights · luggage drop first"),
        block("s2-3", 1, "food", "Nishiki market crawl", "Nishiki Market", "13:30", 120, 5200, "Go hungry. Cash is useful."),
        block("s2-4", 1, "explore", "Pontocho at dusk", "Pontocho Alley", "18:30", 90, 3500, "No reservations — walk until something feels right."),
        block("s2-5", 2, "explore", "Fushimi Inari before crowds", "Fushimi Inari Taisha", "07:30", 180, 0, "Take the side path back down."),
        block("s2-6", 2, "food", "Udon at Okakura", "Higashiyama", "11:30", 60, 2400, "Small shop, short menu."),
        block("s2-7", 2, "explore", "Tea ceremony", "Higashiyama", "14:00", 90, 6000, "Booked under Chen · 2 guests"),
        block("s2-8", 2, "food", "Kaiseki dinner", "Gion Karyo", "19:00", 120, 18000, "The splurge. Go slowly."),
        block("s2-9", 3, "travel", "Local to Arashiyama", "Kyoto → Arashiyama", "08:45", 30, 240, "Rain shell, dry socks."),
        block("s2-10", 3, "explore", "Bamboo grove, light rain", "Arashiyama", "09:30", 60, 0, "Go before the rain sets in; the path holds up."),
        block("s2-11", 3, "food", "Riverside soba under cover", "Katsura River", "11:00", 60, 2800, "Ask for the covered terrace."),
        block("s2-12", 3, "explore", "Kyoto National Museum", "Higashiyama", "13:30", 120, 1400, "Indoor plan B; cab from Arashiyama."),
        block("s2-13", 3, "reset", "Hotel onsen + early night", "Gion", "17:30", 120, 0, "Keep the free evening exactly where it is."),
        block("s2-14", 4, "travel", "Kintetsu to Nara", "Kyoto → Nara", "08:30", 45, 1600, "Rapid express, 2 stops."),
        block("s2-15", 4, "explore", "Nara deer park", "Nara Park", "10:00", 120, 0, "Buy crackers once, not three times."),
        block("s2-16", 4, "food", "Todai-ji & lunch", "Nara", "12:30", 150, 3200, "Try the kakinoha sushi."),
        block("s2-17", 4, "travel", "Back to Kyoto", "Nara → Kyoto", "17:30", 50, 1600, "Beat the commuter rush."),
        block("s2-18", 5, "travel", "Limited express to Osaka", "Kyoto → Osaka", "09:30", 55, 2200, "Breakfast at the station."),
        block("s2-19", 5, "food", "Kuromon market", "Nihonbashi, Osaka", "11:30", 90, 4800, "Split everything."),
        block("s2-20", 5, "explore", "Osaka Castle", "Osaka Castle Park", "14:00", 120, 1200, "The park is free; the keep is optional."),
        block("s2-21", 5, "food", "Dotonbori after dark", "Dotonbori", "18:30", 150, 7600, "Late train back is fine."),
        block("s2-22", 6, "travel", "Uji by local train", "Kyoto → Uji", "09:30", 35, 800, "South exit, then walk."),
        block("s2-23", 6, "explore", "Byodo-in & tea street", "Uji", "10:30", 180, 2400, "Matcha before noon."),
        block("s2-24", 6, "reset", "Slow afternoon", "Uji riverside", "15:00", 120, 0, "Leave room for a nap."),
        block("s2-25", 7, "explore", "Last bamboo slot", "Arashiyama", "07:30", 45, 0, "The dry second chance, before the airport."),
        block("s2-26", 7, "explore", "Last-minute Kyoto gifts", "Teramachi", "10:00", 120, 5000, "Don't buy the first thing."),
        block("s2-27", 7, "travel", "Haruka to KIX", "Kyoto → Kansai Airport", "13:00", 75, 2400, "Allow 2h before the flight."),
      ],
      messages: [
        {
          role: "user",
          text: "It looks wet on Day 3. What moves first if the bamboo grove is a washout?",
          meta: "you · saved",
        },
        {
          role: "agent",
          text: "Move the monkey park, not the bamboo grove. The grove is still atmospheric in light rain; the monkeys are the exposed part. Swap the 14:00 block for the Kyoto National Museum indoors, then take the earliest possible grove slot on Day 7 before the airport. Keep the free evening exactly where it is.",
          meta: "grounded · managed agent",
        },
      ],
      suggestion: {
        label: "Applied to this draft",
        title: "Indoor plan B: Kyoto National Museum",
        meta: "Day 03 · 13:30 · 120 min · ¥1,400",
      },
      usage: {
        model: "Sonnet 4.5",
        tokens: "9,640",
        tokenDetail: "8.1k in · 1.5k out",
        cost: "$0.12",
        context: "12%",
        contextDetail: "24k / 200k window",
        runtime: "31s",
      },
      thinking: [
        { state: "done", title: "Checked the rain window for Day 3", meta: "3s" },
        { state: "done", title: "Ranked exposed versus covered blocks", meta: "9s" },
        { state: "done", title: "Moved the museum to 13:30 indoors", meta: "17s" },
        { state: "active", title: "Kept the free evening untouched", meta: "31s" },
      ],
    },
    {
      id: "budget",
      index: 3,
      title: "Cut ¥30k without losing tea",
      date: "22 Oct · 18:05",
      source: "Local draft",
      summary: "A cheaper food, stay, and rail pass through the same week — tea ceremony and Nishiki untouched.",
      rootTitle: "A slower week in Kansai",
      rootKicker: "Draft 03 / ¥30k",
      dayOverrides: {},
      blocks: [
        block("s3-1", 1, "travel", "Haruka to Kyoto", "Kansai Airport → Kyoto Station", "09:40", 75, 2400, "Reserved seats, car 4"),
        block("s3-2", 1, "stay", "Machiya, simpler room", "Gion, Kyoto", "11:30", 60, 84000, "Same six nights, smaller room; saves ¥12,000."),
        block("s3-3", 1, "food", "Nishiki market crawl", "Nishiki Market", "13:30", 120, 5200, "Protected. Go hungry. Cash is useful."),
        block("s3-4", 1, "explore", "Pontocho at dusk", "Pontocho Alley", "18:30", 90, 3500, "No reservations — walk until something feels right."),
        block("s3-5", 2, "explore", "Fushimi Inari before crowds", "Fushimi Inari Taisha", "07:30", 180, 0, "Take the side path back down."),
        block("s3-6", 2, "food", "Long lunch at a counter", "Higashiyama", "12:00", 90, 8000, "Replaces the udon stop and the kaiseki."),
        block("s3-7", 2, "explore", "Tea ceremony", "Higashiyama", "14:30", 90, 6000, "Protected. Booked under Chen · 2 guests."),
        block("s3-8", 2, "reset", "Free evening, no reservation", "Kyoto", "18:30", 90, 0, "No second dinner to pay for."),
        block("s3-9", 3, "explore", "Bamboo grove, early", "Arashiyama", "09:00", 90, 0, "Before 09:30 it is still quiet."),
        block("s3-10", 3, "food", "Riverside soba", "Katsura River", "11:30", 60, 2800, "Window seat if you can."),
        block("s3-11", 3, "explore", "Monkey park + Okochi Sanso", "Arashiyama", "14:00", 150, 2200, "Wear shoes with grip."),
        block("s3-12", 3, "reset", "Free evening", "Kyoto", "18:00", 120, 0, "Nothing scheduled. Protect this."),
        block("s3-13", 4, "travel", "Kintetsu local to Nara", "Kyoto → Nara", "08:30", 70, 800, "Slower, half the fare."),
        block("s3-14", 4, "explore", "Nara deer park", "Nara Park", "10:00", 120, 0, "Buy crackers once, not three times."),
        block("s3-15", 4, "food", "Todai-ji & lunch", "Nara", "12:30", 150, 3200, "Try the kakinoha sushi."),
        block("s3-16", 4, "travel", "Local back to Kyoto", "Nara → Kyoto", "17:30", 70, 800, "Beat the commuter rush."),
        block("s3-17", 5, "travel", "Limited express to Osaka", "Kyoto → Osaka", "09:30", 55, 2200, "Breakfast at the station."),
        block("s3-18", 5, "food", "Kuromon market", "Nihonbashi, Osaka", "11:30", 90, 4800, "Split everything."),
        block("s3-19", 5, "explore", "Osaka Castle Park, free", "Osaka Castle Park", "14:00", 90, 0, "The park only; skip the keep."),
        block("s3-20", 5, "food", "Standing sushi, Dotonbori", "Dotonbori", "18:30", 75, 1600, "One counter, a few plates, no full dinner."),
        block("s3-21", 6, "travel", "Uji by local train", "Kyoto → Uji", "09:30", 45, 400, "A slower ride, still early."),
        block("s3-22", 6, "explore", "Byodo-in & tea street", "Uji", "10:30", 180, 2400, "Matcha before noon."),
        block("s3-23", 6, "reset", "Slow afternoon", "Uji riverside", "15:00", 120, 0, "Leave room for a nap."),
        block("s3-24", 7, "explore", "Last-minute Kyoto gifts", "Teramachi", "10:00", 120, 3000, "Set a cap; don't buy the first thing."),
        block("s3-25", 7, "travel", "Haruka to KIX", "Kyoto → Kansai Airport", "13:00", 75, 2400, "Allow 2h before the flight."),
      ],
      messages: [
        {
          role: "user",
          text: "Trim about ¥30,000 from the week. Do not touch the tea ceremony or the Nishiki morning.",
          meta: "you · saved",
        },
        {
          role: "agent",
          text: "The kaiseki is the cleanest cut: the ¥18,000 dinner and the udon stop become one ¥8,000 counter lunch, and the day keeps its shape. A simpler room in the same machiya saves ¥12,000. Local trains to Nara and Uji plus a standing sushi counter close the gap. Tea and Nishiki are untouched. That is ¥30,000 exactly.",
          meta: "no model · local draft",
        },
      ],
      suggestion: {
        label: "Applied to this draft",
        title: "Long lunch instead of kaiseki",
        meta: "Day 02 · 12:00 · 90 min · ¥8,000",
      },
      usage: {
        model: "Haiku 4.5",
        tokens: "21,080",
        tokenDetail: "18.4k in · 2.7k out",
        cost: "$0.09",
        context: "26%",
        contextDetail: "52k / 200k window",
        runtime: "58s",
      },
      thinking: [
        { state: "done", title: "Priced every block against ¥260,000", meta: "5s" },
        { state: "done", title: "Protected the tea ceremony and Nishiki", meta: "13s" },
        { state: "done", title: "Found ¥30,000 across food, stay, and rail", meta: "27s" },
        { state: "active", title: "Held the local trains; no express upgrade", meta: "58s" },
      ],
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

  let store = null;
  let state = null;
  let stageW = STAGE_MIN_W;
  let stageH = STAGE_MIN_H;
  let scale = 1;
  let panX = 0;
  let panY = 0;
  let selectedId = null;
  let editingId = null;
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

  function sessionById(id) {
    return sessionSeeds.find((item) => item.id === id) || sessionSeeds[0];
  }

  function layoutSession(seed) {
    const days = BASE_DAYS.map((day, index) => ({
      ...day,
      title: seed.dayOverrides[day.id] || day.title,
      x: DAY_X + index * DAY_PITCH,
      y: DAY_Y,
      w: SIZES.day.w,
      h: SIZES.day.h,
    }));
    const perDay = new Map();
    const blocks = seed.blocks.map((item) => {
      const order = perDay.get(item.dayId) || 0;
      perDay.set(item.dayId, order + 1);
      return {
        ...item,
        x: DAY_X + (item.dayId - 1) * DAY_PITCH,
        y: BLOCK_Y0 + order * BLOCK_PITCH,
        w: SIZES.block.w,
        h: SIZES.block.h,
      };
    });
    return {
      root: { ...ROOT, w: SIZES.root.w, h: SIZES.root.h },
      days,
      blocks,
    };
  }

  function seedStore() {
    const trees = {};
    for (const seed of sessionSeeds) trees[seed.id] = layoutSession(seed);
    return { version: 1, activeId: sessionSeeds[0].id, trees };
  }

  function cleanTree(raw, seed) {
    if (!raw || !Array.isArray(raw.days) || !Array.isArray(raw.blocks)) return null;
    if (raw.days.length !== BASE_DAYS.length) return null;
    const days = BASE_DAYS.map((base, index) => {
      const saved = raw.days.find((day) => Number(day.id) === base.id) || raw.days[index] || {};
      return {
        ...base,
        title: seed.dayOverrides[base.id] || base.title,
        x: Number.isFinite(saved.x) ? saved.x : DAY_X + index * DAY_PITCH,
        y: Number.isFinite(saved.y) ? saved.y : DAY_Y,
        w: SIZES.day.w,
        h: SIZES.day.h,
      };
    });
    const blocks = raw.blocks
      .filter((item) => item && item.id && item.dayId)
      .map((item, index) => {
        const day = days.find((entry) => entry.id === Number(item.dayId)) || days[0];
        const fallbackOrder = index;
        return {
          id: String(item.id),
          dayId: day.id,
          kind: KIND[item.kind] ? item.kind : "explore",
          title: String(item.title || "Untitled block").slice(0, 80),
          place: String(item.place || "").slice(0, 100),
          start: /^\d{2}:\d{2}$/.test(item.start) ? item.start : "10:00",
          duration: clamp(Number(item.duration) || 60, 15, 600),
          cost: Math.max(0, Number(item.cost) || 0),
          note: String(item.note || "").slice(0, 240),
          x: Number.isFinite(item.x) ? item.x : day.x,
          y: Number.isFinite(item.y) ? item.y : BLOCK_Y0 + fallbackOrder * BLOCK_PITCH,
          w: SIZES.block.w,
          h: SIZES.block.h,
        };
      });
    return {
      root: { ...ROOT, w: SIZES.root.w, h: SIZES.root.h },
      days,
      blocks,
    };
  }

  function loadStore() {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (!raw) return seedStore();
      const parsed = JSON.parse(raw);
      if (!parsed || parsed.version !== 1 || !parsed.trees) return seedStore();
      const trees = {};
      for (const seed of sessionSeeds) {
        trees[seed.id] = cleanTree(parsed.trees[seed.id], seed) || layoutSession(seed);
      }
      return {
        version: 1,
        activeId: sessionSeeds.some((seed) => seed.id === parsed.activeId) ? parsed.activeId : sessionSeeds[0].id,
        trees,
      };
    } catch {
      return seedStore();
    }
  }

  function saveStore() {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(store));
    } catch {
      // The session still works when storage is unavailable.
    }
  }

  function activeSeed() {
    return sessionById(store.activeId);
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
    const compact = rect.width < 760;
    panX = Math.max(12, compact ? 12 : (rect.width - stageW * scale) / 2);
    panY = Math.max(12, compact ? 12 : (rect.height - stageH * scale) / 2);
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

  function blocksOnDay(dayId) {
    return state.blocks
      .filter((item) => item.dayId === dayId)
      .sort((a, b) => (a.y - b.y) || a.start.localeCompare(b.start));
  }

  function dayCost(dayId) {
    return state.blocks.filter((item) => item.dayId === dayId).reduce((sum, item) => sum + Number(item.cost || 0), 0);
  }

  function dayCount(dayId) {
    return state.blocks.filter((item) => item.dayId === dayId).length;
  }

  function totalSpent() {
    return state.blocks.reduce((sum, item) => sum + Number(item.cost || 0), 0);
  }

  function createEdge(d, extraClass = "", withArrow = false) {
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", d);
    if (extraClass) path.setAttribute("class", extraClass);
    if (withArrow) path.setAttribute("marker-end", "url(#edgeArrow)");
    edgesSvg.appendChild(path);
  }

  function edgeBetween(from, to, extraClass = "") {
    const fromRight = from.x + from.w;
    const fromCenterY = from.y + from.h / 2;
    const toCenterY = to.y + to.h / 2;
    const forward = to.x >= from.x;
    const startX = forward ? fromRight : from.x;
    const endX = forward ? to.x : to.x + to.w;
    const bend = clamp(Math.abs(endX - startX) * 0.5, 14, 64);
    const c1 = forward ? startX + bend : startX - bend;
    const c2 = forward ? endX - bend : endX + bend;
    return `M ${startX} ${fromCenterY} C ${c1} ${fromCenterY}, ${c2} ${toCenterY}, ${endX} ${toCenterY}`;
  }

  function edgeDown(from, to) {
    const x1 = from.x + from.w / 2;
    const y1 = from.y + from.h;
    const x2 = to.x + to.w / 2;
    const y2 = to.y;
    const bend = clamp((y2 - y1) / 2, 12, 34);
    return `M ${x1} ${y1} C ${x1} ${y1 + bend}, ${x2} ${y2 - bend}, ${x2} ${y2}`;
  }

  function renderEdges() {
    edgesSvg.replaceChildren();

    const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
    defs.innerHTML =
      '<marker id="edgeArrow" viewBox="0 0 10 10" refX="8.4" refY="5" markerWidth="6.4" markerHeight="6.4" orient="auto" markerUnits="strokeWidth"><path d="M1.5 1.6 L8.4 5 L1.5 8.4" fill="none" stroke="#d97757" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></marker>';
    edgesSvg.appendChild(defs);

    const selected = state.blocks.find((item) => item.id === selectedId);
    const days = [...state.days].sort((a, b) => a.id - b.id);

    days.forEach((day, index) => {
      const dayActive = Boolean(selected && selected.dayId === day.id);
      createEdge(
        index > 0 ? edgeBetween(days[index - 1], day) : edgeDown(state.root, day),
        dayActive ? "edge--chain edge--active" : "edge--chain",
        true,
      );

      const blocks = blocksOnDay(day.id);
      if (!blocks.length) return;

      createEdge(edgeDown(day, blocks[0]), dayActive ? "edge--day edge--active" : "edge--day", true);

      blocks.forEach((item, position) => {
        const next = blocks[position + 1];
        if (!next) return;
        createEdge(
          edgeDown(item, next),
          item.id === selectedId ? "edge--seq edge--active" : "edge--seq",
          true,
        );
      });
    });
  }

  function nodeShell(className, node, id) {
    const element = document.createElement("div");
    element.className = `node ${className}`;
    element.style.transform = nodePosition(node);
    element.style.width = `${node.w}px`;
    element.style.height = `${node.h}px`;
    element.dataset.id = id;
    if (id === selectedId) element.classList.add("is-selected");
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
      if (node.id !== "root") selectedId = node.id;
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
        saveStore();
        renderEdges();
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
    const seed = activeSeed();
    const spent = totalSpent();

    const root = document.createElement("div");
    root.className = "node node--root";
    root.style.transform = nodePosition(state.root);
    root.style.width = `${state.root.w}px`;
    root.style.height = `${state.root.h}px`;
    root.innerHTML = `
      <span class="root-kicker">${esc(seed.rootKicker)}</span>
      <div class="root-title">${esc(seed.rootTitle)}</div>
      <div class="root-meta"><span>7 days</span><span>${state.blocks.length} blocks</span></div>
    `;
    root.title = `${seed.rootTitle} · ${formatYen(spent)} planned`;
    stage.appendChild(root);

    for (const day of state.days) {
      const element = nodeShell("node--day", day, `day-${day.id}`);
      element.tabIndex = 0;
      element.setAttribute("role", "button");
      element.setAttribute("aria-label", `Day ${day.id}, ${day.title}. ${dayCount(day.id)} blocks. Press Enter to add a block.`);
      element.innerHTML = `
        <button type="button" class="day-add" aria-label="Add a block to Day ${day.id}">+</button>
        <div class="day-top"><span>D${day.id} · ${day.label} ${day.date}</span></div>
        <div class="day-title">${esc(day.title)}</div>
        <div class="day-meta"><span>${dayCount(day.id)}</span><span>${formatYen(dayCost(day.id))}</span></div>
      `;
      element.title = `Day ${String(day.id).padStart(2, "0")} · ${day.label} ${day.date} · ${day.city} · ${day.title}`;
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
    for (const item of ordered) {
      const element = nodeShell("node--block", item, item.id);
      element.dataset.kind = item.kind;
      element.tabIndex = 0;
      element.setAttribute("role", "button");
      element.setAttribute("aria-label", `${item.title}, Day ${item.dayId}, ${item.start}, ${formatYen(item.cost)}. Press Enter to edit.`);
      const kind = KIND[item.kind] || KIND.explore;
      element.innerHTML = `
        <div class="block-top"><span class="block-kind">${kind.label}</span><span>${item.start}</span></div>
        <div class="block-title">${esc(item.title)}</div>
        <div class="block-foot"><span>${item.duration}m</span><span>${formatYen(item.cost)}</span></div>
      `;
      element.title = `${item.title}\n${item.start} · ${item.duration} min\n${item.place}${item.note ? `\n${item.note}` : ""}`;
      bindNode(element, item, () => openEditor(item.id));
      stage.appendChild(element);
    }

    renderEdges();
  }

  function renderChrome() {
    const seed = activeSeed();
    const spent = totalSpent();
    const share = clamp((spent / TRIP.budget) * 100, 0, 100);
    const blockCount = state.blocks.length;

    $("#tripEyebrow").textContent = `Saved draft 0${seed.index} / local data`;
    $("#trip-title").textContent = seed.title;
    $("#tripSub").textContent = seed.summary;
    $("#conversations-title").textContent = seed.title;
    $("#railTitle").textContent = TRIP.name;
    $("#railSession").textContent = `Draft 0${seed.index} · ${seed.title}`;
    $("#railDays").textContent = String(state.days.length);
    $("#railBlocks").textContent = String(blockCount);
    $("#railSpend").textContent = formatYen(spent);
    $("#railMeter").style.width = `${share.toFixed(1)}%`;
    $("#railBudget").textContent = `of ${formatYen(TRIP.budget)} planned budget · ${Math.round(share)}%`;
    $(".rail-meter").setAttribute("aria-label", `${formatYen(spent)} planned of ${formatYen(TRIP.budget)}`);
    $("#stageNoteOne").textContent = `ROOT → DAY 01 / DRAFT 0${seed.index}`;
    $("#stageNoteTwo").textContent = "DAY 01 → DAY 07";
    $("#stageNoteThree").textContent = `LOCAL / ${blockCount} BLOCKS`;
    document.title = `${seed.title} — TripBlocks demo`;
  }

  function renderSessions() {
    const list = $("#sessionList");
    list.replaceChildren();
    for (const seed of sessionSeeds) {
      const tree = store.trees[seed.id];
      const button = document.createElement("button");
      button.type = "button";
      const active = seed.id === store.activeId;
      button.className = `session-item${active ? " is-active" : ""}`;
      button.setAttribute("role", "tab");
      button.setAttribute("aria-selected", String(active));
      button.setAttribute("aria-controls", "graphPanel conversationsPanel");
      button.dataset.sessionId = seed.id;
      const tag = seed.id === "rain" ? "rain plan" : seed.id === "budget" ? "¥30k cut" : "Day 5 shorter";
      button.innerHTML = `
        <span class="session-num">${String(seed.index).padStart(2, "0")}</span>
        <span class="session-copy">
          <span class="session-top"><span>${esc(seed.source)}</span><span>${esc(seed.date.split(" · ")[0])}</span></span>
          <strong>${esc(seed.title)}</strong>
          <span class="session-foot">${tree ? tree.blocks.length : 0} blocks · ${tag}</span>
        </span>
      `;
      button.addEventListener("click", () => selectSession(seed.id));
      list.appendChild(button);
    }
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

  function updateTranscriptFade() {
    const transcript = $("#convTranscript");
    if (!transcript) return;
    const scrollable = transcript.scrollHeight - transcript.clientHeight > 4;
    const notAtBottom = transcript.scrollTop + transcript.clientHeight < transcript.scrollHeight - 4;
    transcript.classList.toggle("has-fade", scrollable && notAtBottom);
  }

  function renderTranscript() {
    const seed = activeSeed();
    const root = $("#convTranscript");
    root.replaceChildren();
    root.scrollTop = 0;

    const head = document.createElement("div");
    head.className = "transcript-head";
    head.innerHTML = `
      <div><span>Saved ${esc(seed.date)}</span></div>
      <span class="source-tag">${esc(seed.source)}</span>
    `;
    root.appendChild(head);

    seed.messages.forEach((message) => {
      const element = messageElement(message.role, message.text, message.meta);
      if (message.role === "agent" && seed.suggestion) {
        const card = document.createElement("div");
        card.className = "suggestion";
        card.innerHTML = `
          <span class="suggestion-label">${esc(seed.suggestion.label)}</span>
          <strong>${esc(seed.suggestion.title)}</strong>
          <span>${esc(seed.suggestion.meta)}</span>
        `;
        element.appendChild(card);
      }
      root.appendChild(element);
    });

    const note = document.createElement("p");
    note.className = "readonly-line";
    note.textContent = `Saved ${seed.source.toLowerCase()} record · no composer · calls no model.`;
    root.appendChild(note);
  }

  function renderUsage() {
    const seed = activeSeed();
    const grid = $("#usageGrid");
    grid.replaceChildren();
    const contextValue = parseInt(seed.usage.context, 10) || 0;
    const cells = [
      { label: "Model", value: seed.usage.model, detail: "", wide: true },
      { label: "Tokens", value: seed.usage.tokens, detail: seed.usage.tokenDetail },
      { label: "Cost", value: seed.usage.cost, detail: "" },
      { label: "Context", value: seed.usage.context, detail: seed.usage.contextDetail, bar: contextValue },
      { label: "Runtime", value: seed.usage.runtime, detail: "" },
    ];
    for (const cell of cells) {
      const wrap = document.createElement("div");
      wrap.className = `usage-cell${cell.wide ? " usage-cell--wide" : ""}`;
      wrap.innerHTML = `
        <dt>${esc(cell.label)}</dt>
        <dd>${esc(cell.value)}</dd>
        ${cell.detail ? `<span>${esc(cell.detail)}</span>` : ""}
        ${cell.bar === undefined ? "" : `<span class="usage-bar" role="img" aria-label="Context used: ${cell.bar}%"><i style="width:${clamp(cell.bar, 0, 100)}%"></i></span>`}
      `;
      grid.appendChild(wrap);
    }
  }

  function renderThinking() {
    const list = $("#thinkingList");
    list.replaceChildren();
    const seed = activeSeed();
    const last = seed.thinking[seed.thinking.length - 1];
    $("#thinkingSummary").textContent = `${seed.thinking.length} steps · ${last.meta}`;
    seed.thinking.forEach((step, index) => {
      const item = document.createElement("li");
      item.className = `thinking-step thinking-step--${step.state}`;
      if (step.state === "active") item.setAttribute("aria-current", "step");
      item.innerHTML = `
        <span class="thinking-mark" aria-hidden="true">${step.state === "done" ? "✓" : "<i></i>"}</span>
        <span class="thinking-copy">
          <strong>${esc(step.title)}</strong>
          <span class="thinking-meta">${step.state === "done" ? "done" : "active"} · step ${index + 1} · ${esc(step.meta)}</span>
        </span>
      `;
      list.appendChild(item);
    });
  }

  let thinkingOpen = true;
  function applyThinkingOpen() {
    const card = $("#thinkingCard");
    card.classList.toggle("is-open", thinkingOpen);
    $("#thinkingToggle").setAttribute("aria-expanded", String(thinkingOpen));
    window.requestAnimationFrame(updateTranscriptFade);
  }
  $("#thinkingToggle").addEventListener("click", () => {
    thinkingOpen = !thinkingOpen;
    applyThinkingOpen();
  });

  function setMobileView(view) {
    document.body.classList.toggle("mobile-view-chat", view === "chat");
    $$(".mobile-tab").forEach((button) => {
      const active = button.dataset.mobileView === view;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-selected", String(active));
    });
    window.requestAnimationFrame(updateTranscriptFade);
  }
  $$(".mobile-tab").forEach((button) => {
    button.addEventListener("click", () => setMobileView(button.dataset.mobileView));
  });
  $("#convTranscript").addEventListener("scroll", updateTranscriptFade, { passive: true });

  function renderAll() {
    renderSessions();
    renderNodes();
    renderChrome();
    renderTranscript();
    renderUsage();
    renderThinking();
    updateStageSize();
    window.requestAnimationFrame(updateTranscriptFade);
  }

  function selectSession(id) {
    if (!store.trees[id] || store.activeId === id) return;
    closeEditor();
    store.activeId = id;
    state = store.trees[id];
    selectedId = null;
    hasFitted = false;
    renderAll();
    saveStore();
    requestAnimationFrame(fitGraph);
    showToast(`Switched to “${activeSeed().title}” · each draft keeps its own tree`);
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
    const item = blockId ? state.blocks.find((entry) => entry.id === blockId) : null;
    const dayId = item ? item.dayId : presetDay;
    renderDayOptions(dayId);
    $("#editorEyebrow").textContent = item ? "Edit block / this conversation" : "New block / this conversation";
    $("#editorTitle").textContent = item ? item.title : "Add a block";
    $("#fieldTitle").value = item ? item.title : "";
    $("#fieldKind").value = item ? item.kind : "explore";
    $("#fieldStart").value = item ? item.start : "10:00";
    $("#fieldDuration").value = item ? item.duration : 60;
    $("#fieldCost").value = item ? item.cost : 0;
    $("#fieldPlace").value = item ? item.place : "";
    $("#fieldNote").value = item ? item.note : "";
    $("#deleteBlock").hidden = !item;
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
    const day = state.days.find((entry) => entry.id === Number(dayId)) || state.days[0];
    const count = dayCount(day.id);
    return { x: day.x, y: BLOCK_Y0 + count * BLOCK_PITCH };
  }

  blockForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const form = new FormData(blockForm);
    const payload = {
      title: String(form.get("title") || "").trim().slice(0, 80),
      dayId: Number(form.get("dayId")),
      kind: KIND[String(form.get("kind"))] ? String(form.get("kind")) : "explore",
      start: String(form.get("start") || "10:00"),
      duration: clamp(Number(form.get("duration")) || 60, 15, 600),
      cost: Math.max(0, Number(form.get("cost")) || 0),
      place: String(form.get("place") || "").trim().slice(0, 100),
      note: String(form.get("note") || "").trim().slice(0, 240),
    };
    if (!payload.title) {
      $("#fieldTitle").focus();
      return;
    }

    if (editingId) {
      const item = state.blocks.find((entry) => entry.id === editingId);
      if (!item) return;
      const dayChanged = item.dayId !== payload.dayId;
      Object.assign(item, payload);
      if (dayChanged) {
        const position = nextPosition(payload.dayId);
        item.x = position.x;
        item.y = position.y;
      }
      showToast("Block updated · saved with this conversation");
    } else {
      const position = nextPosition(payload.dayId);
      state.blocks.push({
        id: `${store.activeId}-${Date.now()}`,
        ...payload,
        x: position.x,
        y: position.y,
        w: SIZES.block.w,
        h: SIZES.block.h,
      });
      showToast("Block added · saved with this conversation");
    }

    selectedId = editingId;
    closeEditor();
    renderAll();
    saveStore();
  });

  $("#deleteBlock").addEventListener("click", () => {
    if (!editingId) return;
    const item = state.blocks.find((entry) => entry.id === editingId);
    if (!item) return;
    state.blocks = state.blocks.filter((entry) => entry.id !== editingId);
    selectedId = null;
    closeEditor();
    renderAll();
    saveStore();
    showToast(`Removed “${item.title}” · saved with this conversation`);
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
    store = seedStore();
    state = store.trees[store.activeId];
    selectedId = null;
    hasFitted = false;
    thinkingOpen = true;
    applyThinkingOpen();
    try {
      localStorage.removeItem(STORE_KEY);
    } catch {
      // Ignore storage failures; reset is still visible in this session.
    }
    renderAll();
    requestAnimationFrame(fitGraph);
    showToast("Demo reset · three saved drafts restored");
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
      updateTranscriptFade();
    }, 180);
  });

  // Init.
  store = loadStore();
  state = store.trees[store.activeId];
  renderAll();
  requestAnimationFrame(fitGraph);

  window.__tripblocksDemo = {
    reset: () => $("#resetGraph").click(),
    selectSession,
    getActiveId: () => store.activeId,
    getState: () => JSON.parse(JSON.stringify(state)),
    getStore: () => JSON.parse(JSON.stringify(store)),
    fit: fitGraph,
  };
})();
