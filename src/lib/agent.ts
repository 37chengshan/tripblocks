import type { Suggestion, Trip } from "../types";

export type AgentReply = {
  text: string;
  suggestion?: Suggestion;
  source: "managed-agent" | "local";
};

function compactTrip(trip: Trip) {
  return {
    title: trip.title,
    dates: `${trip.days[0]?.month} ${trip.days[0]?.date} — ${trip.days[trip.days.length - 1]?.month} ${trip.days[trip.days.length - 1]?.date}`,
    travelers: trip.travelers,
    budgetJpy: trip.budget,
    pace: trip.pace,
    days: trip.days.map((day) => ({
      id: day.id,
      date: `${day.label} ${day.date}`,
      city: day.city,
      title: day.title,
      blocks: trip.blocks
        .filter((block) => block.dayId === day.id)
        .sort((a, b) => a.start.localeCompare(b.start))
        .map((block) => ({
          kind: block.kind,
          title: block.title,
          place: block.place,
          start: block.start,
          minutes: block.duration,
          costJpy: block.cost,
          note: block.note,
        })),
    })),
  };
}

export async function requestAgent(prompt: string, trip: Trip): Promise<AgentReply> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 55000);
  try {
    const response = await fetch("/api/agent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({ prompt, trip: compactTrip(trip) }),
    });
    if (!response.ok) throw new Error(`Agent request failed: ${response.status}`);
    const data = (await response.json()) as AgentReply;
    if (!data.text?.trim()) throw new Error("Empty agent response");
    return { ...data, source: data.source === "managed-agent" ? "managed-agent" : "local" };
  } finally {
    window.clearTimeout(timeout);
  }
}

export function localReply(prompt: string, trip: Trip): AgentReply {
  const text = prompt.toLowerCase();
  const day5 = trip.days.find((day) => day.id === 5) ?? trip.days[0];
  const day6 = trip.days.find((day) => day.id === 6) ?? trip.days[0];

  if (text.includes("light") || text.includes("lighter") || text.includes("calm")) {
    return {
      text: `Day 5 is doing three things in one day: a market, a castle, and Dotonbori at night. Keep Kuromon, make the castle optional, and turn the evening into one standing counter instead of a full dinner. That buys you ~2 hours and protects the Uji morning.`,
      source: "local",
      suggestion: {
        title: "One standing counter, no reservations",
        place: "Dotonbori, Osaka",
        kind: "food",
        dayId: day5.id,
        start: "19:00",
        duration: 60,
        cost: 3200,
        note: "Replaces the long dinner — keeps the night fun but ends earlier.",
      },
    };
  }

  if (text.includes("rain") || text.includes("wet") || text.includes("indoor")) {
    return {
      text: `Keep Day 3 as the flexible one. If it rains, swap the monkey park for the Kyoto National Museum (indoor, 20 min by taxi) and move the bamboo grove to Day 7 before the airport. Everything else is already under cover or a short walk.`,
      source: "local",
      suggestion: {
        title: "Indoor plan B: Kyoto National Museum",
        place: "Higashiyama, Kyoto",
        kind: "explore",
        dayId: 3,
        start: "14:00",
        duration: 90,
        cost: 1400,
        note: "Rain backup. Swap the monkey park, keep the evening free.",
      },
    };
  }

  if (text.includes("cut") || text.includes("budget") || text.includes("cheap") || text.includes("save")) {
    return {
      text: `The easiest ¥14,000: turn the Day 2 kaiseki into a long lunch at a neighborhood counter, and take the local train to Uji instead of the express. You keep the tea ceremony and the good coffee; you lose only the formal dinner theater.`,
      source: "local",
      suggestion: {
        title: "Long lunch instead of kaiseki",
        place: "Gion, Kyoto",
        kind: "food",
        dayId: 2,
        start: "13:00",
        duration: 90,
        cost: 4800,
        note: "A more relaxed, half-the-price version of the splurge dinner.",
      },
    };
  }

  if (text.includes("eat") || text.includes("food") || text.includes("gion") || text.includes("dinner")) {
    return {
      text: `Near Gion, I would keep it simple: Omen for udon (no booking, good at 11:30), Giro Giro for a modern small-plates dinner, and a standing counter in Pontocho if you want the atmosphere without the tasting-menu commitment.`,
      source: "local",
      suggestion: {
        title: "Giro Giro — small plates",
        place: "Gion, Kyoto",
        kind: "food",
        dayId: day6.id,
        start: "18:30",
        duration: 90,
        cost: 6000,
        note: "Relaxed neighborhood room; book the counter.",
      },
    };
  }

  return {
    text: `The shape is good: Kyoto first, Nara as a day trip, Osaka one night, then Uji before you fly. The only real tension is Day 5 — it is the fullest day and sits right before an early tea morning. Want me to lighten it or leave it as the big night out?`,
    source: "local",
    suggestion: {
      title: "Move Osaka Castle to the morning",
      place: "Osaka Castle Park",
      kind: "explore",
      dayId: day5.id,
      start: "10:00",
      duration: 90,
      cost: 1200,
      note: "Frees the afternoon for a proper pause before Dotonbori.",
    },
  };
}
