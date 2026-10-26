import type {
  Block,
  BlockKind,
  CityKey,
  Session,
  SessionStatus,
  SessionUsage,
  Trip,
} from "./types";

export const cityMeta: Record<CityKey, { name: string; jp: string; tint: string; ink: string }> = {
  kyoto: { name: "Kyoto", jp: "京都", tint: "#e7ded1", ink: "#6a5544" },
  nara: { name: "Nara", jp: "奈良", tint: "#e3e6d6", ink: "#59634b" },
  osaka: { name: "Osaka", jp: "大阪", tint: "#dfe7e8", ink: "#4e666d" },
  uji: { name: "Uji", jp: "宇治", tint: "#e8e2ce", ink: "#74643e" },
  kix: { name: "Kansai", jp: "関西", tint: "#ece5dc", ink: "#7b6d5e" },
};

export const kindMeta: Record<
  BlockKind,
  { label: string; tone: string; soft: string; border: string; icon: string }
> = {
  travel: { label: "Move", tone: "#525252", soft: "#f5f5f3", border: "rgba(0,0,0,.10)", icon: "train" },
  stay: { label: "Stay", tone: "#525252", soft: "#f5f5f3", border: "rgba(0,0,0,.10)", icon: "bed" },
  explore: { label: "Explore", tone: "#525252", soft: "#f5f5f3", border: "rgba(0,0,0,.10)", icon: "compass" },
  food: { label: "Taste", tone: "#525252", soft: "#f5f5f3", border: "rgba(0,0,0,.10)", icon: "utensils" },
  reset: { label: "Breathe", tone: "#525252", soft: "#f5f5f3", border: "rgba(0,0,0,.10)", icon: "leaf" },
};

const NAMES = ["Fri", "Sat", "Sun", "Mon", "Tue", "Wed", "Thu"];
const DATES = ["06", "07", "08", "09", "10", "11", "12"];

let seq = 0;
const b = (
  dayId: number,
  kind: BlockKind,
  title: string,
  place: string,
  start: string,
  duration: number,
  cost: number,
  note = "",
  locked = false,
): Block => ({
  id: `b${++seq}`,
  dayId,
  kind,
  title,
  place,
  start,
  duration,
  cost,
  note,
  locked,
});

export const initialTrip: Trip = {
  title: "A slower week in Kansai",
  subtitle: "Temples, tea, and one very good bowl of udon.",
  startDate: "2026-11-06",
  travelers: 2,
  budget: 260000,
  pace: "Slow",
  days: [
    { id: 1, label: NAMES[0], date: DATES[0], month: "NOV", city: "kyoto", title: "Land & exhale" },
    { id: 2, label: NAMES[1], date: DATES[1], month: "NOV", city: "kyoto", title: "East Kyoto" },
    { id: 3, label: NAMES[2], date: DATES[2], month: "NOV", city: "kyoto", title: "Arashiyama" },
    { id: 4, label: NAMES[3], date: DATES[3], month: "NOV", city: "nara", title: "Nara day" },
    { id: 5, label: NAMES[4], date: DATES[4], month: "NOV", city: "osaka", title: "Osaka, late" },
    { id: 6, label: NAMES[5], date: DATES[5], month: "NOV", city: "uji", title: "Tea country" },
    { id: 7, label: NAMES[6], date: DATES[6], month: "NOV", city: "kyoto", title: "Slow goodbye" },
  ],
  blocks: [
    b(1, "travel", "Haruka to Kyoto", "Kansai Airport → Kyoto Station", "09:40", 75, 2400, "Reserved seats, car 4", true),
    b(1, "stay", "Machiya check-in", "Gion, Kyoto", "11:30", 60, 96000, "Six nights · luggage drop first", true),
    b(1, "food", "Nishiki market crawl", "Nishiki Market", "13:30", 120, 5200, "Go hungry. Cash is useful."),
    b(1, "explore", "Pontocho at dusk", "Pontocho Alley", "18:30", 90, 3500, "No reservations — walk until something feels right."),
    b(2, "explore", "Fushimi Inari before crowds", "Fushimi Inari Taisha", "07:30", 180, 0, "Take the side path back down."),
    b(2, "food", "Udon at Okakura", "Higashiyama", "11:30", 60, 2400, "Small shop, short menu."),
    b(2, "explore", "Tea ceremony", "Higashiyama", "14:00", 90, 6000, "Booked under Chen · 2 guests", true),
    b(2, "food", "Kaiseki dinner", "Gion Karyo", "19:00", 120, 18000, "The splurge. Go slowly."),
    b(3, "explore", "Bamboo grove, early", "Arashiyama", "09:00", 90, 0, "Before 9:30 it is still quiet."),
    b(3, "food", "Riverside soba", "Katsura River", "11:30", 60, 2800, "Window seat if you can."),
    b(3, "explore", "Monkey park + Okochi Sanso", "Arashiyama", "14:00", 150, 2200, "Wear shoes with grip."),
    b(3, "reset", "Free evening", "Kyoto", "18:00", 120, 0, "Nothing scheduled. Protect this."),
    b(4, "travel", "Kintetsu to Nara", "Kyoto → Nara", "08:30", 45, 1600, "Rapid express, 2 stops."),
    b(4, "explore", "Nara deer park", "Nara Park", "10:00", 120, 0, "Buy crackers once, not three times."),
    b(4, "food", "Todai-ji & lunch", "Nara", "12:30", 150, 3200, "Try the kakinoha sushi."),
    b(4, "travel", "Back to Kyoto", "Nara → Kyoto", "17:30", 50, 1600, "Beat the commuter rush."),
    b(5, "travel", "Limited express to Osaka", "Kyoto → Osaka", "09:30", 55, 2200, "Breakfast at the station."),
    b(5, "food", "Kuromon market", "Nihonbashi, Osaka", "11:30", 90, 4800, "Split everything."),
    b(5, "explore", "Osaka Castle", "Osaka Castle Park", "14:00", 120, 1200, "The park is free; the keep is optional."),
    b(5, "food", "Dotonbori after dark", "Dotonbori", "18:30", 150, 7600, "Late train back is fine."),
    b(6, "travel", "Uji by local train", "Kyoto → Uji", "09:30", 35, 800, "South exit, then walk."),
    b(6, "explore", "Byodo-in & tea street", "Uji", "10:30", 180, 2400, "Matcha before noon."),
    b(6, "reset", "Slow afternoon", "Uji riverside", "15:00", 120, 0, "Leave room for a nap."),
    b(7, "explore", "Last-minute Kyoto gifts", "Teramachi", "10:00", 120, 5000, "Don't buy the first thing."),
    b(7, "travel", "Haruka to KIX", "Kyoto → Kansai Airport", "13:00", 75, 2400, "Allow 2h before the flight.", true),
  ],
};

export const quickPrompts = [
  "Make Day 5 lighter",
  "Find a rainy-day plan",
  "Cut ¥30k",
  "Where should we eat near Gion?",
];

export const cityOrder: CityKey[] = ["kyoto", "nara", "osaka", "uji"];

export const cityCoord: Record<CityKey, { x: number; y: number }> = {
  kyoto: { x: 30, y: 32 },
  nara: { x: 45, y: 59 },
  osaka: { x: 62, y: 42 },
  uji: { x: 43, y: 48 },
  kix: { x: 45, y: 85 },
};

export function tripCost(trip: Trip): number {
  return trip.blocks.reduce((sum, block) => sum + block.cost, 0);
}

export function formatYen(value: number): string {
  return `¥${Math.round(value).toLocaleString("en-US")}`;
}

export function formatTokens(value: number): string {
  if (value >= 1000) {
    const thousands = value / 1000;
    const digits = thousands >= 10 ? 0 : 1;
    return `${thousands.toFixed(digits).replace(/\.0$/, "")}k`;
  }
  return String(Math.max(0, Math.round(value)));
}

export function formatRuntime(ms: number): string {
  if (ms < 1000) return `${Math.max(0, Math.round(ms))}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.round((ms % 60000) / 1000);
  return `${minutes}m ${String(seconds).padStart(2, "0")}s`;
}

export function parseMinutes(start: string): number {
  const [h, m] = start.split(":").map(Number);
  return h * 60 + m;
}

export function formatTime(minutes: number): string {
  const h = Math.floor(minutes / 60) % 24;
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function emptyUsage(model = "Sonnet 4.5"): SessionUsage {
  return {
    model,
    inputTokens: 0,
    outputTokens: 0,
    estimatedCostJpy: 0,
    runtimeMs: 0,
    contextUsed: 0,
    contextMax: 200000,
  };
}

export const sessionStatusMeta: Record<SessionStatus, { label: string; dotClass: string }> = {
  live: { label: "Live", dotClass: "bg-moss" },
  saved: { label: "Saved", dotClass: "bg-muted/40" },
  local: { label: "Local", dotClass: "bg-sun" },
};

function buildTrip(prefix: string, edit: (trip: Trip) => void): Trip {
  const trip = structuredClone(initialTrip);
  edit(trip);
  return {
    ...trip,
    blocks: trip.blocks.map((block) => ({ ...block, id: `${prefix}-${block.id}` })),
    positions: undefined,
  };
}

/**
 * Three saved, fictional sessions. Each one has a genuinely different tree;
 * none of them claims to be the result of a live model call.
 */
export function createSeedSessions(): Session[] {
  const lighter = buildTrip("s1", (trip) => {
    trip.title = "Kansai, with a lighter Thursday";
    trip.subtitle = "The same loop, but Day 5 ends before the last train.";
    trip.days = trip.days.map((day) =>
      day.id === 5 ? { ...day, title: "Osaka, early night" } : day,
    );
    trip.blocks = trip.blocks.filter((block) => block.dayId !== 5);
    trip.blocks.push(
      b(5, "travel", "Limited express to Osaka", "Kyoto → Osaka", "09:30", 55, 2200, "Breakfast at the station."),
      b(5, "food", "Kuromon, standing only", "Nihonbashi, Osaka", "11:30", 75, 3600, "Split three things, then leave."),
      b(5, "reset", "Nakanoshima pause", "Nakanoshima riverbank", "14:00", 60, 0, "A bench and a drink. Nothing to see."),
      b(5, "food", "One counter, no reservations", "Dotonbori", "18:00", 75, 3800, "Eat, then take the 20:10 train."),
      b(5, "travel", "Early train home", "Osaka → Kyoto", "20:10", 55, 2200, "Back before the crowds thin."),
    );
    // Keep the block list in day/time order so the persisted tree reads cleanly.
    trip.blocks.sort((a, c) => a.dayId - c.dayId || parseMinutes(a.start) - parseMinutes(c.start));
  });

  const rainy = buildTrip("s2", (trip) => {
    trip.title = "Arashiyama, under cover";
    trip.subtitle = "A wet Wednesday without losing the west side.";
    trip.days = trip.days.map((day) =>
      day.id === 3 ? { ...day, title: "Arashiyama, indoors" } : day,
    );
    trip.blocks = trip.blocks.filter((block) => block.dayId !== 3);
    trip.blocks.push(
      b(3, "explore", "Bamboo grove, early", "Arashiyama", "09:00", 75, 0, "Go before 9:30. Short walk if it pours."),
      b(3, "food", "Riverside soba", "Katsura River", "11:30", 60, 2800, "Window seat if the rain lets up."),
      b(3, "travel", "Taxi to Higashiyama", "Arashiyama → Higashiyama", "13:20", 20, 1800, "The one dry-hop concession."),
      b(3, "explore", "Kyoto National Museum", "Higashiyama, Kyoto", "14:00", 120, 1400, "Indoor, calm, open when it rains."),
      b(3, "reset", "Free evening", "Kyoto", "18:00", 120, 0, "Nothing scheduled. Protect this."),
    );
    trip.blocks.sort((a, c) => a.dayId - c.dayId || parseMinutes(a.start) - parseMinutes(c.start));
  });

  const cut = buildTrip("s3", (trip) => {
    trip.title = "Kansai, ¥30k lighter";
    trip.subtitle = "The same week and the same tea — just less restaurant theatre.";
    trip.budget = 220000;
    const byId = new Map(trip.blocks.map((block) => [block.id, block]));
    const edit = (id: string, patch: Partial<Block>) => {
      const block = byId.get(id);
      if (block) Object.assign(block, patch);
    };
    edit("b3", { cost: 3600, note: "Three stalls, not six. Cash is still useful." });
    edit("b4", { cost: 2500, note: "One drink, then walk home." });
    edit("b8", {
      title: "Kaiseki lunch",
      place: "Gion Karyo",
      start: "12:30",
      duration: 90,
      cost: 4800,
      note: "The same kitchen at lunch. Booked under Chen.",
    });
    edit("b10", { cost: 1800 });
    edit("b13", { cost: 800, note: "Local line, one change. Ten minutes slower." });
    edit("b15", { cost: 1800 });
    edit("b16", { cost: 800 });
    edit("b17", { cost: 1100, note: "Local to Osaka. Breakfast still at the station." });
    edit("b18", { cost: 3600 });
    edit("b19", { cost: 600, note: "The park is free; one paid pavilion is enough." });
    edit("b20", { cost: 4200, note: "One counter instead of the long dinner." });
    edit("b21", { cost: 540, note: "Two changes, forty minutes. It's fine." });
    edit("b22", { cost: 1600 });
    edit("b24", { cost: 2000, note: "Two small gifts, not five." });
  });

  return [
    {
      id: "day5-lighter",
      title: "Make Day 5 lighter",
      meta: "Wander · 26 blk",
      time: "2m ago",
      status: "live",
      sample: true,
      trip: lighter,
      messages: [
        {
          id: "s1-m1",
          role: "assistant",
          source: "managed-agent",
          text: "Day 5 was the only day asking for three things at once: a market, a castle, and Dotonbori after dark. I moved the pause to Nakanoshima at 14:00 and kept the night to one counter, so you can take the 20:10 train back.",
          suggestion: {
            title: "A quiet pause before Dotonbori",
            place: "Nakanoshima riverbank",
            kind: "reset",
            dayId: 5,
            start: "14:00",
            duration: 60,
            cost: 0,
            note: "A bench, a drink, no agenda — so the night does not run straight into the early Uji train.",
          },
        },
        {
          id: "s1-m2",
          role: "user",
          text: "Keep one good counter though — I don't want a sad early night.",
        },
        {
          id: "s1-m3",
          role: "assistant",
          source: "managed-agent",
          text: "Fair. One standing counter at 18:00, then the 20:10 limited express. You still get Osaka at night, just not the 21:30 version.",
          suggestion: {
            title: "One counter, no reservations",
            place: "Dotonbori, Osaka",
            kind: "food",
            dayId: 5,
            start: "18:00",
            duration: 75,
            cost: 3800,
            note: "Eat standing, leave when you are done, and still make the early train.",
          },
        },
      ],
      usage: {
        model: "Sonnet 4.5",
        inputTokens: 12480,
        outputTokens: 1920,
        estimatedCostJpy: 18,
        runtimeMs: 6400,
        contextUsed: 34200,
        contextMax: 200000,
      },
      thinking: [
        { id: "s1-t1", label: "Read the Day 5 tree", detail: "market → castle → dinner · ¥15.8k", status: "done" },
        { id: "s1-t2", label: "Found the seam", detail: "Day 5 ends 21:00 · Day 6 starts 09:30", status: "done" },
        { id: "s1-t3", label: "Drafted two moves", detail: "pause at Nakanoshima · counter at 18:00", status: "done" },
        { id: "s1-t4", label: "Checked the last train", detail: "20:10 limited express · 55 min", status: "done" },
      ],
    },
    {
      id: "arashiyama-rain",
      title: "Rainy-day Arashiyama",
      meta: "Wander · 26 blk",
      time: "Yesterday",
      status: "saved",
      sample: true,
      trip: rainy,
      messages: [
        {
          id: "s2-m1",
          role: "user",
          text: "What if it rains through the whole Arashiyama morning?",
        },
        {
          id: "s2-m2",
          role: "assistant",
          source: "managed-agent",
          text: "Then the bamboo is a short, wet walk and the museum does the rest. I replaced the monkey park with the Kyoto National Museum and put one taxi between the river and Higashiyama so you are not crossing town damp.",
          suggestion: {
            title: "Indoor plan B: Kyoto National Museum",
            place: "Higashiyama, Kyoto",
            kind: "explore",
            dayId: 3,
            start: "14:00",
            duration: 120,
            cost: 1400,
            note: "Rain backup. Swap the monkey park, keep the evening free.",
          },
        },
        {
          id: "s2-m3",
          role: "assistant",
          source: "managed-agent",
          text: "The day costs about ¥1,000 more because of the taxi, but from 14:00 you are indoors. Day 3 is still the flexible one.",
        },
      ],
      usage: {
        model: "Sonnet 4.5",
        inputTokens: 8960,
        outputTokens: 1240,
        estimatedCostJpy: 12,
        runtimeMs: 4800,
        contextUsed: 27400,
        contextMax: 200000,
      },
      thinking: [
        { id: "s2-t1", label: "Checked the weather window", detail: "Wednesday afternoon · 70% rain", status: "done" },
        { id: "s2-t2", label: "Swapped the outdoor block", detail: "monkey park → Kyoto National Museum", status: "done" },
        { id: "s2-t3", label: "Re-costed the route", detail: "+¥1,800 taxi · −¥800 museum", status: "done" },
      ],
    },
    {
      id: "cut-30k",
      title: "Cut ¥30k without losing tea",
      meta: "Local · 25 blk",
      time: "3d ago",
      status: "local",
      sample: true,
      draft: true,
      trip: cut,
      messages: [
        {
          id: "s3-m1",
          role: "assistant",
          source: "local",
          text: "I cut ¥30,160 without touching the tea ceremony: kaiseki moves to lunch, the Uji train goes local, and the Nara trip uses the slower line. The tree shows every new cost.",
          suggestion: {
            title: "Kaiseki at lunch",
            place: "Gion Karyo",
            kind: "food",
            dayId: 2,
            start: "12:30",
            duration: 90,
            cost: 4800,
            note: "Same kitchen, lunch price. The tea ceremony at 14:00 is untouched.",
          },
        },
        {
          id: "s3-m2",
          role: "user",
          text: "Does the tea morning still work?",
        },
        {
          id: "s3-m3",
          role: "assistant",
          source: "local",
          text: "Yes — Day 6 still starts at 09:30 and the tea street is unchanged. The only thing that moved is dinner on Day 2; it is now lunch at 12:30, before the ceremony.",
        },
      ],
      usage: {
        model: "Local planner",
        inputTokens: 0,
        outputTokens: 0,
        estimatedCostJpy: 0,
        runtimeMs: 1200,
        contextUsed: 18100,
        contextMax: 200000,
      },
      thinking: [
        { id: "s3-t1", label: "Scanned the week for waste", detail: "kaiseki dinner · Uji express · Nara rail", status: "done" },
        { id: "s3-t2", label: "Kept the tea ceremony", detail: "Day 2 14:00 · untouched", status: "done" },
        { id: "s3-t3", label: "Re-costed the tree", detail: "−¥30,160 · new total ¥141,140", status: "done" },
      ],
    },
  ];
}
