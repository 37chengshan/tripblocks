import type { Block, BlockKind, CityKey, Trip } from "./types";

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
  travel: { label: "Move", tone: "#52646b", soft: "#e5edee", border: "#c8d7da", icon: "train" },
  stay: { label: "Stay", tone: "#765347", soft: "#f0e4de", border: "#decbbf", icon: "bed" },
  explore: { label: "Explore", tone: "#56644e", soft: "#e8ecdf", border: "#d0d8c4", icon: "compass" },
  food: { label: "Taste", tone: "#94653d", soft: "#f4e8d5", border: "#e4d2b8", icon: "utensils" },
  reset: { label: "Breathe", tone: "#746f66", soft: "#eeeae2", border: "#dcd5c7", icon: "leaf" },
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
  "Cut ¥300",
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

export function parseMinutes(start: string): number {
  const [h, m] = start.split(":").map(Number);
  return h * 60 + m;
}

export function formatTime(minutes: number): string {
  const h = Math.floor(minutes / 60) % 24;
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}
