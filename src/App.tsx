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
import { CalendarDays, Map, PanelRightOpen, Plus, Sparkles, Wallet } from "lucide-react";
import { AddBlockSheet } from "./components/AddBlockSheet";
import { BudgetView } from "./components/BudgetView";
import { CanvasBoard, initialCanvasPosition } from "./components/CanvasBoard";
import { Companion } from "./components/Companion";
import { FlyAISheet } from "./components/FlyAISheet";
import { Inspector } from "./components/Inspector";
import { KindIcon } from "./components/KindIcon";
import { RouteMap } from "./components/RouteMap";
import { SideRail, type ViewKey } from "./components/SideRail";
import { Hero, TopBar } from "./components/TopBar";
import { TripBoard } from "./components/TripBoard";
import {
  createSeedSessions,
  emptyUsage,
  formatRuntime,
  formatTime,
  formatTokens,
  kindMeta,
  parseMinutes,
  sessionStatusMeta,
  tripCost,
} from "./data";
import { localReply, requestAgent, type AgentReply } from "./lib/agent";
import type { Block, ChatMessage, CityKey, Session, Suggestion, Trip } from "./types";

const STORAGE_KEY = "tripblocks:sessions:v2";
const LEGACY_KEY = "tripblocks:kansai:v1";
const SIDEBAR_KEY = "tripblocks:sidebar:v1";
const CHAT_PANEL_KEY = "tripblocks:chat-panel:v1";

type Workspace = {
  sessions: Session[];
  activeId: string;
};

function readLegacyTrip(): Trip | null {
  try {
    const raw = localStorage.getItem(LEGACY_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Trip;
    if (Array.isArray(parsed.days) && parsed.days.length === 7 && Array.isArray(parsed.blocks)) {
      return parsed;
    }
  } catch {
    // A broken local draft should never block the seeded sessions.
  }
  return null;
}

function loadWorkspace(): Workspace {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<Workspace>;
      if (Array.isArray(parsed.sessions) && parsed.sessions.length > 0) {
        const sessions = parsed.sessions
          .filter(
            (session): session is Session =>
              Boolean(
                session &&
                  session.id &&
                  session.trip &&
                  Array.isArray(session.trip.days) &&
                  Array.isArray(session.trip.blocks) &&
                  Array.isArray(session.messages),
              ),
          )
          .map((session) => {
            const usage = session.usage ?? emptyUsage();
            return {
              ...session,
              status: sessionStatusMeta[session.status] ? session.status : "saved",
              meta: session.meta || `${usage.model} · ${session.trip.blocks.length} blk`,
              time: session.time || "Saved",
              usage,
              // A reload kills the in-flight request, so any active/pending steps
              // can never finish. Keep only the steps that actually completed.
              thinking: Array.isArray(session.thinking)
                ? session.thinking.filter((step) => step.status === "done")
                : [],
            };
          });
        if (sessions.length > 0) {
          const activeId = sessions.some((session) => session.id === parsed.activeId)
            ? (parsed.activeId as string)
            : sessions[0].id;
          return { sessions, activeId };
        }
      }
    }
  } catch {
    // Fall through to the seeded workspace.
  }

  const seeded = createSeedSessions();
  const legacy = readLegacyTrip();
  if (legacy) {
    const migrated: Session = {
      id: "migrated-v1",
      title: "Your Kansai trip",
      meta: "Migrated draft · local",
      time: "Imported",
      status: "local",
      trip: legacy,
      messages: [],
      usage: emptyUsage("Local planner"),
      thinking: [],
    };
    return { sessions: [migrated, ...seeded], activeId: migrated.id };
  }
  return { sessions: seeded, activeId: seeded[0].id };
}

function loadRailCollapsed(): boolean {
  try {
    const raw = localStorage.getItem(SIDEBAR_KEY);
    if (raw === "collapsed") return true;
    if (raw === "expanded") return false;
  } catch {
    // Storage can be unavailable; fall back to the viewport default.
  }
  return window.innerWidth < 1280;
}

function loadChatPanelOpen(): boolean {
  try {
    return localStorage.getItem(CHAT_PANEL_KEY) !== "closed";
  } catch {
    return true;
  }
}

export default function App() {
  const [initialWorkspace] = useState<Workspace>(loadWorkspace);
  const [sessions, setSessions] = useState<Session[]>(initialWorkspace.sessions);
  const [activeSessionId, setActiveSessionId] = useState(initialWorkspace.activeId);
  const [railCollapsed, setRailCollapsed] = useState(loadRailCollapsed);
  const [rightOpen, setRightOpen] = useState(loadChatPanelOpen);
  const [view, setView] = useState<ViewKey>("canvas");
  const [mobilePanel, setMobilePanel] = useState<"plan" | "wander">("plan");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [addDay, setAddDay] = useState<number | null>(null);
  const [agentOnline, setAgentOnline] = useState(true);
  const [flyOpen, setFlyOpen] = useState(false);
  const [flyCity, setFlyCity] = useState<CityKey>("kyoto");
  const [flyDay, setFlyDay] = useState(1);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<number | null>(null);

  const activeSession = sessions.find((session) => session.id === activeSessionId) ?? sessions[0];
  const trip = activeSession.trip;
  const usage = activeSession.usage;
  const thinking = activeSession.thinking;
  const running = thinking.some((step) => step.status === "active");
  const spent = useMemo(() => tripCost(trip), [trip]);
  const selectedBlock = selectedId ? trip.blocks.find((block) => block.id === selectedId) ?? null : null;
  const selectedDay = selectedBlock ? trip.days.find((day) => day.id === selectedBlock.dayId) : null;
  const activeBlock = activeId ? trip.blocks.find((block) => block.id === activeId) ?? null : null;

  const collisionDetection: CollisionDetection = (args) => {
    const pointerCollisions = pointerWithin(args);
    return pointerCollisions.length > 0 ? pointerCollisions : rectIntersection(args);
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor),
  );

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ version: 2, activeId: activeSessionId, sessions }),
      );
    } catch {
      // Private browsing can refuse storage; the session still works.
    }
  }, [sessions, activeSessionId]);

  useEffect(() => {
    try {
      localStorage.setItem(SIDEBAR_KEY, railCollapsed ? "collapsed" : "expanded");
    } catch {
      // Non-critical preference.
    }
  }, [railCollapsed]);

  useEffect(() => {
    try {
      localStorage.setItem(CHAT_PANEL_KEY, rightOpen ? "open" : "closed");
    } catch {
      // Non-critical preference.
    }
  }, [rightOpen]);

  useEffect(
    () => () => {
      if (toastTimer.current) window.clearTimeout(toastTimer.current);
    },
    [],
  );

  function notify(message: string) {
    setToast(message);
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 3200);
  }

  function updateSession(id: string, updater: (session: Session) => Session) {
    setSessions((prev) => prev.map((session) => (session.id === id ? updater(session) : session)));
  }

  function clearTransient() {
    setSelectedId(null);
    setAddDay(null);
    setActiveId(null);
    setFlyOpen(false);
    setMobilePanel("plan");
  }

  function switchSession(id: string) {
    if (id === activeSessionId) {
      setMobilePanel("plan");
      return;
    }
    setActiveSessionId(id);
    clearTransient();
  }

  function createSession() {
    const id = `session-${Date.now().toString(36)}`;
    const next: Session = {
      id,
      title: "Untitled session",
      meta: `Wander · ${trip.blocks.length} blk`,
      time: "just now",
      status: "live",
      sample: false,
      trip: structuredClone(trip),
      messages: [],
      usage: emptyUsage(usage.model),
      thinking: [],
    };
    setSessions((prev) => [next, ...prev]);
    setActiveSessionId(id);
    clearTransient();
    notify("New session from this tree");
  }

  function updateBlock(next: Block) {
    updateSession(activeSession.id, (session) => {
      const previous = session.trip.blocks.find((block) => block.id === next.id);
      const positions = session.trip.positions ? { ...session.trip.positions } : undefined;
      if (positions && previous && (previous.start !== next.start || previous.dayId !== next.dayId)) {
        delete positions[next.id];
      }
      return {
        ...session,
        trip: {
          ...session.trip,
          positions,
          blocks: session.trip.blocks.map((block) => (block.id === next.id ? next : block)),
        },
      };
    });
    setSelectedId(null);
    notify("Block updated");
  }

  function deleteBlock(id: string) {
    updateSession(activeSession.id, (session) => {
      const positions = session.trip.positions ? { ...session.trip.positions } : undefined;
      if (positions) delete positions[id];
      return {
        ...session,
        trip: {
          ...session.trip,
          positions,
          blocks: session.trip.blocks.filter((block) => block.id !== id),
        },
      };
    });
    setSelectedId(null);
    notify("Removed from the plan");
  }

  function addBlock(input: Omit<Block, "id">) {
    const block: Block = { ...input, id: `block-${Date.now()}-${Math.round(Math.random() * 9999)}` };
    updateSession(activeSession.id, (session) => ({
      ...session,
      trip: {
        ...session.trip,
        blocks: [...session.trip.blocks, block],
        positions: { ...session.trip.positions, [block.id]: initialCanvasPosition(session.trip, block) },
      },
    }));
    setAddDay(null);
    setActiveId(null);
    setSelectedId(null);
    notify(`Added to Day ${block.dayId}`);
  }

  function moveNode(id: string, position: { x: number; y: number }, schedule?: { dayId: number; start: string }) {
    updateSession(activeSession.id, (session) => ({
      ...session,
      trip: {
        ...session.trip,
        positions: { ...session.trip.positions, [id]: position },
        blocks: schedule
          ? session.trip.blocks.map((block) =>
              block.id === id ? { ...block, dayId: schedule.dayId, start: schedule.start } : block,
            )
          : session.trip.blocks,
      },
    }));
    notify(schedule ? `Rescheduled · Day ${schedule.dayId} at ${schedule.start}` : "Canvas layout saved");
  }

  function resetLayout() {
    updateSession(activeSession.id, (session) => ({
      ...session,
      trip: { ...session.trip, positions: {} },
    }));
    notify("Auto layout reapplied");
  }

  function applySuggestion(suggestion: Suggestion) {
    addBlock({ ...suggestion, locked: false });
    setView("canvas");
    setMobilePanel("plan");
  }

  async function send(prompt: string) {
    const target = sessions.find((session) => session.id === activeSessionId);
    if (!target || target.thinking.some((step) => step.status === "active")) return;
    const targetId = target.id;
    const startedAt = performance.now();
    const stamp = Date.now();

    updateSession(targetId, (session) => ({
      ...session,
      sample: false,
      status: "live",
      messages: [
        ...session.messages,
        { id: `user-${stamp}`, role: "user", text: prompt, source: undefined },
      ],
      thinking: [
        {
          id: `think-${stamp}-1`,
          label: "Reading this tree",
          detail: `${session.trip.blocks.length} blocks · ${session.trip.days.length} days`,
          status: "active",
        },
        {
          id: `think-${stamp}-2`,
          label: "Checking the seams",
          detail: "late nights before early starts",
          status: "pending",
        },
        {
          id: `think-${stamp}-3`,
          label: "Drafting one change",
          detail: "waiting on the planner",
          status: "pending",
        },
      ],
    }));

    let reply: AgentReply;
    try {
      reply = await requestAgent(prompt, target.trip);
      setAgentOnline(true);
    } catch {
      setAgentOnline(false);
      notify("Wander is offline — using the local planner");
      reply = localReply(prompt, target.trip);
    }

    const runtimeMs = Math.max(600, Math.round(performance.now() - startedAt));
    const inputTokens = Math.max(60, Math.round(prompt.length / 3));
    const outputTokens = Math.max(40, Math.round(reply.text.length / 3));
    const assistant: ChatMessage = {
      id: `wander-${stamp}`,
      role: "assistant",
      text: reply.text,
      suggestion: reply.suggestion,
      source: reply.source,
    };

    updateSession(targetId, (session) => ({
      ...session,
      sample: false,
      status: reply.source === "managed-agent" ? "live" : "local",
      meta:
        reply.source === "managed-agent"
          ? session.meta
          : `Local · ${session.trip.blocks.length} blk`,
      messages: [...session.messages, assistant],
      usage: {
        ...session.usage,
        model: reply.source === "managed-agent" ? session.usage.model : "Local planner",
        inputTokens: session.usage.inputTokens + inputTokens,
        outputTokens: session.usage.outputTokens + outputTokens,
        estimatedCostJpy:
          session.usage.estimatedCostJpy +
          (reply.source === "managed-agent"
            ? Math.max(1, Math.round(inputTokens * 0.004 + outputTokens * 0.012))
            : 0),
        runtimeMs,
        contextUsed: Math.min(session.usage.contextMax, session.usage.contextUsed + inputTokens + outputTokens),
      },
      thinking: [
        {
          id: `done-${stamp}-1`,
          label: "Read this tree",
          detail: `${session.trip.blocks.length} blocks · ${session.trip.days.length} days`,
          status: "done",
        },
        {
          id: `done-${stamp}-2`,
          label: "Checked the seams",
          detail: reply.source === "managed-agent" ? "late nights before early starts" : "planned locally",
          status: "done",
        },
        {
          id: `done-${stamp}-3`,
          label: "Drafted one suggestion",
          detail: reply.suggestion ? reply.suggestion.title : "held the plan as-is",
          status: "done",
        },
        {
          id: `done-${stamp}-4`,
          label: "Answered",
          detail: `${formatRuntime(runtimeMs)} · ${formatTokens(inputTokens + outputTokens)} tokens`,
          status: "done",
        },
      ],
    }));
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

    updateSession(activeSession.id, (session) => {
      const positions = session.trip.positions ? { ...session.trip.positions } : undefined;
      if (positions && (targetDay !== block.dayId || start !== block.start)) delete positions[block.id];
      return {
        ...session,
        trip: {
          ...session.trip,
          positions,
          blocks: session.trip.blocks.map((item) =>
            item.id === block.id ? { ...item, dayId: targetDay, start } : item,
          ),
        },
      };
    });
    if (targetDay !== block.dayId) notify(`Moved to Day ${targetDay}`);
    else notify(`Reordered in Day ${targetDay}`);
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
    anchor.download = `tripblocks-${activeSession.id}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    notify("Active session exported");
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
      key={activeSession.id}
      session={activeSession}
      running={running}
      onSend={(prompt) => void send(prompt)}
      onAddSuggestion={applySuggestion}
      onClose={() => setMobilePanel("plan")}
      onCollapse={() => setRightOpen(false)}
      agentOnline={agentOnline}
    />
  );

  return (
    <div className="flex h-[100dvh] flex-col overflow-hidden bg-surface-1 text-ink">
      <TopBar onExport={exportPlan} onShare={share} sessionTitle={activeSession.title} />

      <div className="flex min-h-0 flex-1">
        <SideRail
          sessions={sessions}
          activeId={activeSession.id}
          onSelect={switchSession}
          onNew={createSession}
          view={view}
          onView={openView}
          spent={spent}
          budget={trip.budget}
          onWander={() => setMobilePanel("wander")}
          agentOnline={agentOnline}
          collapsed={railCollapsed}
          onToggleCollapse={() => setRailCollapsed((value) => !value)}
        />

        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <div className="flex h-11 shrink-0 items-center gap-2 border-b border-line bg-surface-0 px-3 lg:hidden">
            <span className="shrink-0 font-mono text-[11px] uppercase tracking-[0.1em] text-muted">
              Sessions
            </span>
            <div className="flex min-w-0 flex-1 gap-1.5 overflow-x-auto no-scrollbar" aria-label="Conversations">
              {sessions.map((session) => {
                const isActive = session.id === activeSession.id;
                return (
                  <button
                    key={session.id}
                    onClick={() => switchSession(session.id)}
                    aria-current={isActive ? "true" : undefined}
                    className={`flex h-8 shrink-0 items-center gap-1.5 rounded-full px-2.5 text-[11px] transition-colors ${
                      isActive ? "bg-black/[.06] text-clay-ink" : "text-muted hover:text-ink"
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 shrink-0 rounded-full ${sessionStatusMeta[session.status].dotClass}`}
                      aria-hidden="true"
                    />
                    <span className="max-w-[112px] truncate">{session.title}</span>
                  </button>
                );
              })}
            </div>
            <button
              onClick={createSession}
              className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-muted transition-colors hover:bg-black/[.04] hover:text-ink"
              aria-label="New session from this tree"
            >
              <Plus size={15} />
            </button>
          </div>

          <div className="flex min-h-0 min-w-0 flex-1">
            <main
              className={`min-h-0 min-w-0 flex-1 ${
                view === "canvas"
                  ? "flex flex-col overflow-hidden pb-[calc(70px+env(safe-area-inset-bottom))] xl:pb-0"
                  : "overflow-y-auto pb-[calc(78px+env(safe-area-inset-bottom))] xl:pb-0"
              }`}
            >
              {view === "canvas" && (
                <CanvasBoard
                  sessionKey={activeSession.id}
                  trip={trip}
                  selectedId={selectedId}
                  onSelect={setSelectedId}
                  onAdd={setAddDay}
                  onMove={moveNode}
                  onResetLayout={resetLayout}
                  onBoard={() => setView("board")}
                />
              )}

              {view === "board" && (
                <>
                  <Hero
                    title={trip.title}
                    subtitle={trip.subtitle}
                    onOptimize={() =>
                      ask(
                        "Tune this trip. Look at the whole week and suggest the smallest changes that make it calmer without losing the tea ceremony or the good food.",
                      )
                    }
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
                          className="w-[226px] rotate-2 rounded-xl border bg-surface-2 px-3 py-3 shadow-[0_4px_8px_rgba(0,0,0,.06),0_12px_28px_-2px_rgba(0,0,0,.08)]"
                          style={{ borderColor: kindMeta[activeBlock.kind].border }}
                        >
                          <div
                            className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.06em]"
                            style={{ color: kindMeta[activeBlock.kind].tone }}
                          >
                            <KindIcon kind={activeBlock.kind} size={12} /> {kindMeta[activeBlock.kind].label}
                          </div>
                          <div className="mt-2 font-mono text-[11px] text-muted">
                            {activeBlock.start} · {activeBlock.duration} min
                          </div>
                          <div className="mt-1 text-[13px] font-medium">{activeBlock.title}</div>
                        </div>
                      )}
                    </DragOverlay>
                  </DndContext>
                </>
              )}

              {view === "map" && <RouteMap trip={trip} onAsk={ask} />}
              {view === "budget" && <BudgetView trip={trip} onAsk={ask} />}

              <footer
                className={`mx-4 mb-4 shrink-0 items-center justify-between border-t border-line px-1 py-4 text-[11px] text-muted md:mx-7 ${
                  view === "canvas" ? "hidden xl:flex" : "flex"
                }`}
              >
                <span className="font-mono uppercase tracking-[0.08em]">Tripblocks · {trip.blocks.length} blocks</span>
                <span className="flex items-center gap-1.5">
                  <span
                    className={`h-1 w-1 rounded-full ${
                      activeSession.sample ? "bg-muted/40" : agentOnline ? "bg-moss" : "bg-sun"
                    }`}
                  />
                  {activeSession.sample
                    ? "Saved example · no live calls"
                    : agentOnline
                      ? "Managed Agent connected"
                      : "Local fallback"}
                </span>
              </footer>
            </main>

            {rightOpen ? (
              <div id="companion-panel" className="hidden w-[384px] shrink-0 xl:flex">
                {companion}
              </div>
            ) : (
              <div
                className="hidden w-12 shrink-0 flex-col items-center border-l border-line bg-surface-1 py-3 xl:flex"
                aria-label="Chat panel collapsed"
              >
                <button
                  onClick={() => setRightOpen(true)}
                  className="grid h-8 w-8 place-items-center rounded-lg text-muted transition-colors hover:bg-black/[.04] hover:text-ink"
                  aria-label="Open chat panel"
                  aria-expanded={false}
                  aria-controls="companion-panel"
                  title="Open chat panel"
                >
                  <PanelRightOpen size={15} />
                </button>
                <span className="mt-3 select-none font-mono text-[11px] uppercase tracking-[0.14em] text-muted [writing-mode:vertical-rl]">
                  Chat
                </span>
                <span
                  className={`mt-2 h-1.5 w-1.5 rounded-full ${
                    running ? "animate-breathe bg-clay" : sessionStatusMeta[activeSession.status].dotClass
                  }`}
                  aria-hidden="true"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface-1 px-2 pb-[max(6px,env(safe-area-inset-bottom))] pt-1.5 xl:hidden">
        <div className="mx-auto flex max-w-md items-center justify-around">
          {[
            { key: "canvas" as const, label: "Plan", icon: CalendarDays },
            { key: "map" as const, label: "Map", icon: Map },
            { key: "budget" as const, label: "Budget", icon: Wallet },
          ].map((item) => {
            const active =
              mobilePanel === "plan" && (view === item.key || (item.key === "canvas" && view === "board"));
            const Icon = item.icon;
            return (
              <button
                key={item.key}
                onClick={() => openView(item.key)}
                className={`flex min-h-11 flex-1 flex-col items-center justify-center gap-0.5 rounded-lg py-1 text-[11px] transition-colors ${
                  active ? "text-clay-ink" : "text-muted"
                }`}
              >
                <Icon size={17} strokeWidth={active ? 2 : 1.6} />
                {item.label}
              </button>
            );
          })}
          <button
            onClick={() => setMobilePanel("wander")}
            className={`flex min-h-11 flex-1 flex-col items-center justify-center gap-0.5 rounded-lg py-1 text-[11px] transition-colors ${
              mobilePanel === "wander" ? "text-clay-ink" : "text-muted"
            }`}
          >
            <Sparkles size={17} strokeWidth={mobilePanel === "wander" ? 2 : 1.6} />
            Chat
          </button>
        </div>
      </nav>

      {mobilePanel === "wander" && (
        <div className="fixed inset-0 z-50 flex flex-col bg-surface-1 pt-[env(safe-area-inset-top)] xl:hidden">
          {companion}
        </div>
      )}

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
        <AddBlockSheet days={trip.days} initialDay={addDay} onClose={() => setAddDay(null)} onAdd={addBlock} />
      )}

      {toast && (
        <div
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className="pointer-events-none fixed bottom-[calc(84px+env(safe-area-inset-bottom))] left-1/2 z-[70] -translate-x-1/2 rounded-full border border-line bg-ink px-4 py-2 text-[11px] text-white shadow-[0_4px_8px_rgba(0,0,0,.06),0_12px_28px_-2px_rgba(0,0,0,.08)] xl:bottom-6"
        >
          {toast}
        </div>
      )}
    </div>
  );
}
