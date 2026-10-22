import { useEffect, useMemo, useRef, useState } from "react";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  pointerWithin,
  rectIntersection,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
  type CollisionDetection,
} from "@dnd-kit/core";
import { CalendarDays, Map, Sparkles, Wallet } from "lucide-react";
import { AddBlockSheet } from "./components/AddBlockSheet";
import { BudgetView } from "./components/BudgetView";
import { Companion } from "./components/Companion";
import { FlyAISheet } from "./components/FlyAISheet";
import { Inspector } from "./components/Inspector";
import { KindIcon } from "./components/KindIcon";
import { RouteMap } from "./components/RouteMap";
import { SideRail, type ViewKey } from "./components/SideRail";
import { Hero, TopBar } from "./components/TopBar";
import { TripBoard } from "./components/TripBoard";
import { formatTime, initialTrip, kindMeta, parseMinutes } from "./data";
import { localReply, requestAgent } from "./lib/agent";
import type { Block, ChatMessage, CityKey, Suggestion, Trip } from "./types";

const STORAGE_KEY = "tripblocks:kansai:v1";

const seedMessages: ChatMessage[] = [
  {
    id: "seed-1",
    role: "assistant",
    source: "managed-agent",
    text: "I read the shape of your week: Kyoto first, Nara as a day trip, one Osaka night, then Uji. It is a good loop. The one tension is Day 5 — it ends late before an early tea morning. I would keep Dotonbori loose and protect the pause before it.",
    suggestion: {
      title: "A quiet pause before Dotonbori",
      place: "Nakanoshima riverbank",
      kind: "reset",
      dayId: 5,
      start: "17:30",
      duration: 45,
      cost: 0,
      note: "A bench, a drink, no agenda — so the big night doesn't run straight into the early train.",
    },
  },
];

function loadTrip(): Trip {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Trip;
      if (Array.isArray(parsed.days) && Array.isArray(parsed.blocks) && parsed.days.length === 7) {
        return parsed;
      }
    }
  } catch {
    // A broken local draft should never block the sample trip.
  }
  return structuredClone(initialTrip);
}

export default function App() {
  const [trip, setTrip] = useState<Trip>(loadTrip);
  const [view, setView] = useState<ViewKey>("board");
  const [mobilePanel, setMobilePanel] = useState<"plan" | "wander">("plan");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [addDay, setAddDay] = useState<number | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>(seedMessages);
  const [thinking, setThinking] = useState(false);
  const [agentOnline, setAgentOnline] = useState(true);
  const [flyOpen, setFlyOpen] = useState(false);
  const [flyCity, setFlyCity] = useState<CityKey>("kyoto");
  const [flyDay, setFlyDay] = useState(1);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<number | null>(null);

  const collisionDetection: CollisionDetection = (args) => {
    const pointerCollisions = pointerWithin(args);
    return pointerCollisions.length > 0 ? pointerCollisions : rectIntersection(args);
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor),
  );

  const spent = useMemo(() => trip.blocks.reduce((sum, block) => sum + block.cost, 0), [trip.blocks]);
  const selectedBlock = selectedId ? trip.blocks.find((block) => block.id === selectedId) ?? null : null;
  const selectedDay = selectedBlock ? trip.days.find((day) => day.id === selectedBlock.dayId) : null;
  const activeBlock = activeId ? trip.blocks.find((block) => block.id === activeId) ?? null : null;

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(trip));
    } catch {
      // Private browsing can refuse storage; the session still works.
    }
  }, [trip]);

  useEffect(() => () => {
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
  }, []);

  function notify(message: string) {
    setToast(message);
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 3200);
  }

  function updateBlock(next: Block) {
    setTrip((prev) => ({ ...prev, blocks: prev.blocks.map((block) => (block.id === next.id ? next : block)) }));
    setSelectedId(null);
    notify("Block updated");
  }

  function deleteBlock(id: string) {
    setTrip((prev) => ({ ...prev, blocks: prev.blocks.filter((block) => block.id !== id) }));
    setSelectedId(null);
    notify("Removed from the plan");
  }

  function addBlock(input: Omit<Block, "id">) {
    const block: Block = { ...input, id: `block-${Date.now()}-${Math.round(Math.random() * 9999)}` };
    setTrip((prev) => ({ ...prev, blocks: [...prev.blocks, block] }));
    setAddDay(null);
    setActiveId(null);
    setSelectedId(null);
    notify(`Added to Day ${block.dayId}`);
  }

  function applySuggestion(suggestion: Suggestion) {
    addBlock({ ...suggestion, locked: false });
    setView("board");
    setMobilePanel("plan");
  }

  async function send(prompt: string) {
    if (thinking) return;
    const userMessage: ChatMessage = { id: `user-${Date.now()}`, role: "user", text: prompt };
    setMessages((prev) => [...prev, userMessage]);
    setThinking(true);
    setMobilePanel("wander");
    try {
      const reply = await requestAgent(prompt, trip);
      setAgentOnline(true);
      setMessages((prev) => [
        ...prev,
        {
          id: `wander-${Date.now()}`,
          role: "assistant",
          text: reply.text,
          suggestion: reply.suggestion,
          source: reply.source,
        },
      ]);
    } catch {
      setAgentOnline(false);
      const reply = localReply(prompt, trip);
      setMessages((prev) => [
        ...prev,
        {
          id: `wander-${Date.now()}`,
          role: "assistant",
          text: reply.text,
          suggestion: reply.suggestion,
          source: "local",
        },
      ]);
    } finally {
      setThinking(false);
    }
  }

  function ask(prompt: string) {
    void send(prompt);
  }

  function handleDragStart(event: DragStartEvent) {
    setActiveId(String(event.active.id));
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;
    const block = trip.blocks.find((item) => item.id === String(active.id));
    if (!block) return;

    const overId = String(over.id);
    const targetBlock = trip.blocks.find((item) => item.id === overId);
    const targetDay = overId.startsWith("day-")
      ? Number(overId.slice(4))
      : targetBlock?.dayId ?? block.dayId;

    let start = block.start;
    if (targetBlock && targetBlock.id !== block.id) {
      start = formatTime(Math.max(0, parseMinutes(targetBlock.start) - 1));
    } else if (targetDay !== block.dayId) {
      start = "09:00";
    }

    setTrip((prev) => ({
      ...prev,
      blocks: prev.blocks.map((item) => (item.id === block.id ? { ...item, dayId: targetDay, start } : item)),
    }));
    if (targetDay !== block.dayId) notify(`Moved to Day ${targetDay}`);
  }

  function share() {
    navigator.clipboard
      ?.writeText(window.location.href)
      .then(() => notify("Private link copied"))
      .catch(() => notify("Copy this page's URL to share"));
  }

  function exportPlan() {
    const blob = new Blob([JSON.stringify(trip, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "tripblocks-kansai.json";
    anchor.click();
    URL.revokeObjectURL(url);
    notify("Plan exported as JSON");
  }

  function openView(next: ViewKey) {
    setView(next);
    setMobilePanel("plan");
  }

  const flyCheckIn = trip.startDate;
  const flyCheckOut = (() => {
    const date = new Date(`${trip.startDate}T12:00:00`);
    if (Number.isNaN(date.getTime())) return "2026-11-12";
    date.setDate(date.getDate() + 6);
    return date.toISOString().slice(0, 10);
  })();

  function openFlyAI(city: CityKey = "kyoto", dayId = 1) {
    setFlyCity(city);
    setFlyDay(dayId);
    setFlyOpen(true);
  }

  const companion = (
    <Companion
      trip={trip}
      messages={messages}
      thinking={thinking}
      onSend={(prompt) => void send(prompt)}
      onAddSuggestion={applySuggestion}
      onClose={() => setMobilePanel("plan")}
      agentOnline={agentOnline}
    />
  );

  return (
    <div className="paper-grain flex h-[100dvh] flex-col overflow-hidden bg-paper">
      <TopBar onExport={exportPlan} onShare={share} />

      <div className="flex min-h-0 flex-1">
        <SideRail view={view} onView={openView} spent={spent} budget={trip.budget} onWander={() => setMobilePanel("wander")} agentOnline={agentOnline} />

        <div className={`flex min-h-0 min-w-0 flex-1 ${mobilePanel === "wander" ? "hidden xl:flex" : "flex"}`}>
          <main className="min-w-0 flex-1 overflow-y-auto pb-[78px] xl:pb-0">
            {view === "board" && (
              <>
                <Hero
                  title={trip.title}
                  subtitle={trip.subtitle}
                  onOptimize={() => ask("Tune this trip. Look at the whole week and suggest the smallest changes that make it calmer without losing the tea ceremony or the good food.")}
                  onShare={share}
                />
                <DndContext
                  sensors={sensors}
                  collisionDetection={collisionDetection}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                  onDragCancel={() => setActiveId(null)}
                >
                  <TripBoard
                    trip={trip}
                    onAdd={setAddDay}
                    onSelect={setSelectedId}
                    onAsk={ask}
                    onFlyAI={() => openFlyAI("kyoto", 1)}
                  />
                  <DragOverlay>
                    {activeBlock && (
                      <div
                        className="w-[226px] rotate-2 rounded-[13px] border bg-card px-3 py-3 shadow-2xl"
                        style={{ borderColor: kindMeta[activeBlock.kind].border }}
                      >
                        <div className="flex items-center gap-1.5 text-[9px] font-medium uppercase tracking-[0.06em]" style={{ color: kindMeta[activeBlock.kind].tone }}>
                          <KindIcon kind={activeBlock.kind} size={12} /> {kindMeta[activeBlock.kind].label}
                        </div>
                        <div className="mt-2 text-[10px] text-muted">{activeBlock.start} · {activeBlock.duration} min</div>
                        <div className="mt-1 text-[13px] font-medium">{activeBlock.title}</div>
                      </div>
                    )}
                  </DragOverlay>
                </DndContext>
              </>
            )}

            {view === "map" && <RouteMap trip={trip} onAsk={ask} />}
            {view === "budget" && <BudgetView trip={trip} onAsk={ask} />}

            <footer className="mx-4 mb-4 flex items-center justify-between border-t border-line/60 px-1 py-4 text-[9px] text-faint md:mx-7">
              <span>TRIPBLOCKS · a calmer way to travel</span>
              <span className="flex items-center gap-1.5"><span className={`h-1 w-1 rounded-full ${agentOnline ? "bg-moss" : "bg-sun"}`} /> {agentOnline ? "Managed Agent connected" : "Local fallback"}</span>
            </footer>
          </main>

          <div className="hidden w-[374px] shrink-0 xl:flex">{companion}</div>
        </div>

        {mobilePanel === "wander" && (
          <div className="flex min-h-0 flex-1 pb-[70px] xl:hidden">{companion}</div>
        )}
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-paper/95 px-3 pb-[max(8px,env(safe-area-inset-bottom))] pt-2 backdrop-blur-xl xl:hidden">
        <div className="mx-auto flex max-w-md items-center justify-around">
          {[
            { key: "board" as const, label: "Plan", icon: CalendarDays },
            { key: "map" as const, label: "Map", icon: Map },
            { key: "budget" as const, label: "Budget", icon: Wallet },
          ].map((item) => {
            const active = mobilePanel === "plan" && view === item.key;
            const Icon = item.icon;
            return (
              <button
                key={item.key}
                onClick={() => openView(item.key)}
                className={`flex flex-1 flex-col items-center gap-1 rounded-lg py-1.5 text-[9px] transition ${active ? "text-clay" : "text-faint"}`}
              >
                <Icon size={17} strokeWidth={active ? 2 : 1.6} />
                {item.label}
              </button>
            );
          })}
          <button
            onClick={() => setMobilePanel("wander")}
            className={`flex flex-1 flex-col items-center gap-1 rounded-lg py-1.5 text-[9px] transition ${mobilePanel === "wander" ? "text-clay" : "text-faint"}`}
          >
            <Sparkles size={17} strokeWidth={mobilePanel === "wander" ? 2 : 1.6} />
            Wander
          </button>
        </div>
      </nav>

      <FlyAISheet
        open={flyOpen}
        initialCity={flyCity}
        days={trip.days}
        initialDay={flyDay}
        checkIn={flyCheckIn}
        checkOut={flyCheckOut}
        onClose={() => setFlyOpen(false)}
        onAdd={(block) => {
          addBlock(block);
          setFlyOpen(false);
        }}
      />

      {selectedBlock && selectedDay && (
        <Inspector
          block={selectedBlock}
          dayLabel={`Day ${selectedDay.id} · ${selectedDay.label} ${selectedDay.date} · ${selectedDay.title}`}
          onClose={() => setSelectedId(null)}
          onSave={updateBlock}
          onDelete={deleteBlock}
        />
      )}

      {addDay !== null && (
        <AddBlockSheet
          days={trip.days}
          initialDay={addDay}
          onClose={() => setAddDay(null)}
          onAdd={addBlock}
        />
      )}

      {toast && (
        <div className="fixed bottom-[84px] left-1/2 z-[70] -translate-x-1/2 rounded-full border border-ink/10 bg-ink px-4 py-2 text-[10px] text-paper shadow-xl xl:bottom-6">
          {toast}
        </div>
      )}

    </div>
  );
}
