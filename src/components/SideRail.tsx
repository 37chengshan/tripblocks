import {
  CalendarDays,
  Map,
  MessageSquare,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Sparkles,
  Wallet,
} from "lucide-react";
import { formatYen, sessionStatusMeta } from "../data";
import type { Session } from "../types";

export type ViewKey = "canvas" | "board" | "map" | "budget";

const items = [
  { key: "canvas" as const, label: "Itinerary", icon: CalendarDays },
  { key: "map" as const, label: "Route map", icon: Map },
  { key: "budget" as const, label: "Budget", icon: Wallet },
];

export function SideRail({
  sessions,
  activeId,
  onSelect,
  onNew,
  view,
  onView,
  spent,
  budget,
  onWander,
  agentOnline = true,
  collapsed = false,
  onToggleCollapse,
}: {
  sessions: Session[];
  activeId: string;
  onSelect: (id: string) => void;
  onNew: () => void;
  view: ViewKey;
  onView: (view: ViewKey) => void;
  spent: number;
  budget: number;
  onWander: () => void;
  agentOnline?: boolean;
  collapsed?: boolean;
  onToggleCollapse: () => void;
}) {
  const active = sessions.find((session) => session.id === activeId) ?? sessions[0];
  if (!active) return null;
  const left = budget - spent;
  const usedPercent = budget > 0 ? Math.min(100, Math.round((spent / budget) * 100)) : 0;

  if (collapsed) {
    return (
      <aside
        id="session-rail"
        className="hidden shrink-0 flex-col border-r border-line bg-surface-0 lg:flex"
        style={{ width: 64 }}
        aria-label="Conversations"
      >
        <div className="flex h-11 shrink-0 items-center justify-center border-b border-hairline">
          <button
            onClick={onToggleCollapse}
            className="grid h-8 w-8 place-items-center rounded-lg text-muted transition-colors hover:bg-black/[.04] hover:text-ink"
            aria-label="Expand sidebar"
            aria-expanded={false}
            aria-controls="session-rail"
            title="Expand sidebar"
          >
            <PanelLeftOpen size={15} />
          </button>
        </div>

        <div className="flex min-h-0 flex-1 flex-col items-center gap-1 overflow-y-auto px-2 py-2 no-scrollbar" role="list" aria-label="Conversations">
          {sessions.map((session) => {
            const meta = sessionStatusMeta[session.status];
            const isActive = session.id === activeId;
            return (
              <div key={session.id} role="listitem">
                <button
                  onClick={() => onSelect(session.id)}
                  className={`relative grid h-10 w-10 place-items-center rounded-lg transition-colors ${
                    isActive
                      ? "bg-black/[.05] text-clay-ink"
                      : "text-muted hover:bg-black/[.035] hover:text-ink"
                  }`}
                  aria-label={`${session.title} · ${session.time}`}
                  aria-current={isActive ? "true" : undefined}
                  title={`${session.title} · ${session.time}`}
                >
                  <MessageSquare size={15} strokeWidth={isActive ? 2 : 1.7} />
                  <span className={`absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full ${meta.dotClass}`} aria-hidden="true" />
                </button>
              </div>
            );
          })}
          <button
            onClick={onNew}
            className="grid h-10 w-10 place-items-center rounded-lg text-muted transition-colors hover:bg-black/[.035] hover:text-ink"
            aria-label="New session from this tree"
            title="New session from this tree"
          >
            <Plus size={16} />
          </button>
        </div>

        <div className="shrink-0 border-t border-hairline px-2 py-2">
          <nav aria-label="Trip views" className="space-y-0.5">
            {items.map((item) => {
              const itemActive = view === item.key || (item.key === "canvas" && view === "board");
              const Icon = item.icon;
              return (
                <button
                  key={item.key}
                  onClick={() => onView(item.key)}
                  className={`grid h-9 w-full place-items-center rounded-lg transition-colors ${
                    itemActive ? "bg-black/[.05] text-clay-ink" : "text-muted hover:bg-black/[.035] hover:text-ink"
                  }`}
                  aria-label={item.label}
                  aria-current={itemActive ? "page" : undefined}
                  title={item.label}
                >
                  <Icon size={15} />
                </button>
              );
            })}
          </nav>
          <div className="mx-2 mt-2 h-0.5 overflow-hidden rounded-full bg-black/10" title={`${usedPercent}% of budget`}>
            <div className="h-full rounded-full bg-clay" style={{ width: `${usedPercent}%` }} />
          </div>
          <button
            onClick={onWander}
            className="mt-2 grid h-9 w-full place-items-center rounded-lg bg-clay-soft text-clay-ink transition-colors hover:bg-clay-soft/70"
            aria-label="Ask Wander"
            title="Ask Wander"
          >
            <Sparkles size={15} />
          </button>
        </div>
      </aside>
    );
  }

  return (
    <aside
      id="session-rail"
      className="hidden shrink-0 flex-col border-r border-line bg-surface-0 lg:flex"
      style={{ width: 288 }}
      aria-label="Conversations"
    >
      <div className="flex h-11 shrink-0 items-center justify-between border-b border-hairline pl-3 pr-1.5">
        <span className="font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-muted">
          Conversations
        </span>
        <div className="flex items-center gap-0.5">
          <button
            onClick={onNew}
            className="grid h-8 w-8 place-items-center rounded-lg text-muted transition-colors hover:bg-black/[.04] hover:text-ink"
            aria-label="New session from this tree"
            title="New session"
          >
            <Plus size={15} />
          </button>
          <button
            onClick={onToggleCollapse}
            className="grid h-8 w-8 place-items-center rounded-lg text-muted transition-colors hover:bg-black/[.04] hover:text-ink"
            aria-label="Collapse sidebar"
            aria-expanded
            aria-controls="session-rail"
            title="Collapse sidebar"
          >
            <PanelLeftClose size={15} />
          </button>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-2 py-2" role="list" aria-label="Conversations">
        <div className="px-1 pb-1 font-mono text-[11px] uppercase tracking-[0.1em] text-faint">
          Recent
        </div>
        <div className="space-y-0.5">
          {sessions.map((session) => {
            const meta = sessionStatusMeta[session.status];
            const isActive = session.id === activeId;
            return (
              <div key={session.id} role="listitem">
                <button
                  onClick={() => onSelect(session.id)}
                  className={`flex h-9 w-full items-center gap-2 rounded-lg px-2 text-left transition-colors ${
                    isActive ? "bg-black/[.05]" : "hover:bg-black/[.035]"
                  }`}
                  aria-current={isActive ? "true" : undefined}
                  aria-label={`${session.title}, ${session.time}, ${meta.label}${session.sample ? ", saved example" : ""}`}
                >
                  <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${meta.dotClass}`} aria-hidden="true" />
                  <span className="min-w-0 flex-1">
                    <span
                      className={`block truncate text-[12px] font-medium leading-4 ${
                        isActive ? "text-clay-ink" : "text-ink"
                      }`}
                    >
                      {session.title}
                    </span>
                    <span className="block truncate font-mono text-[11px] leading-[13px] text-muted">
                      {session.time} · {session.meta}
                      {session.sample ? " · sample" : ""}
                    </span>
                  </span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <div className="shrink-0 border-t border-hairline px-2 pb-2 pt-2">
        <nav aria-label="Trip views" className="space-y-0.5">
          {items.map((item) => {
            const itemActive = view === item.key || (item.key === "canvas" && view === "board");
            const Icon = item.icon;
            return (
              <button
                key={item.key}
                onClick={() => onView(item.key)}
                className={`group flex h-8 w-full items-center gap-2.5 rounded-lg px-2.5 text-left text-[12px] transition-colors ${
                  itemActive ? "bg-black/[.05] text-ink" : "text-muted hover:bg-black/[.035] hover:text-ink"
                }`}
                aria-current={itemActive ? "page" : undefined}
              >
                <Icon
                  size={15}
                  strokeWidth={1.7}
                  className={itemActive ? "text-clay-ink" : "text-muted"}
                />
                <span className="flex-1">{item.label}</span>
                {itemActive && <span className="h-1 w-1 rounded-full bg-clay" aria-hidden="true" />}
              </button>
            );
          })}
        </nav>

        <div className="mt-2 rounded-lg bg-black/[.03] px-2.5 py-2">
          <div className="flex items-center justify-between gap-2 text-[11px]">
            <span className="truncate text-muted">{active.trip.title}</span>
            <span className="shrink-0 tabular-nums text-muted">{usedPercent}%</span>
          </div>
          <div className="mt-1.5 h-0.5 overflow-hidden rounded-full bg-black/10">
            <div className="h-full rounded-full bg-clay" style={{ width: `${usedPercent}%` }} />
          </div>
          <div className="mt-1 flex items-center justify-between font-mono text-[11px] text-muted">
            <span>{formatYen(left)} left</span>
            <span>{active.trip.blocks.length} blocks</span>
          </div>
        </div>

        <button
          onClick={onWander}
          className="mt-2 flex h-9 w-full items-center gap-2 rounded-lg px-2 text-left transition-colors hover:bg-black/[.04]"
        >
          <span className="grid h-6 w-6 shrink-0 place-items-center rounded-lg bg-clay text-white">
            <Sparkles size={12} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[12px] font-medium text-ink">Ask Wander</span>
            <span className="block truncate font-mono text-[11px] text-muted">
              {agentOnline ? "Agent ready" : "Local fallback"}
            </span>
          </span>
          <span
            className={`h-1.5 w-1.5 shrink-0 rounded-full ${agentOnline ? "bg-moss" : "bg-sun"}`}
            aria-hidden="true"
          />
        </button>
      </div>
    </aside>
  );
}
