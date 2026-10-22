import { CalendarDays, CircleAlert, Map, Sparkles, Wallet } from "lucide-react";
import { formatYen } from "../data";

export type ViewKey = "board" | "map" | "budget";

const items = [
  { key: "board" as const, label: "Itinerary", icon: CalendarDays },
  { key: "map" as const, label: "Route map", icon: Map },
  { key: "budget" as const, label: "Budget", icon: Wallet },
];

export function SideRail({
  view,
  onView,
  spent,
  budget,
  onWander,
  agentOnline = true,
}: {
  view: ViewKey;
  onView: (view: ViewKey) => void;
  spent: number;
  budget: number;
  onWander: () => void;
  agentOnline?: boolean;
}) {
  const left = budget - spent;
  return (
    <aside className="hidden w-[224px] shrink-0 flex-col border-r border-line/70 bg-paper/50 lg:flex">
      <div className="px-5 pb-5 pt-6">
        <div className="flex items-center gap-2 text-[10px] font-medium tracking-[0.18em] text-faint">
          <span className="h-px w-4 bg-line" /> YOUR TRIP
        </div>
        <h2 className="mt-2 font-display text-[27px] leading-none">Kansai, slowly</h2>
        <p className="mt-2 text-[11px] leading-relaxed text-muted">Seven days. Two people. No rushing.</p>
      </div>

      <nav className="space-y-0.5 px-3">
        {items.map((item) => {
          const active = view === item.key;
          const Icon = item.icon;
          return (
            <button
              key={item.key}
              onClick={() => onView(item.key)}
              className={`group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-[12px] transition ${
                active ? "bg-card text-ink shadow-[0_1px_0_rgba(255,255,255,.7)_inset]" : "text-muted hover:bg-card/50 hover:text-ink"
              }`}
            >
              <Icon size={15} strokeWidth={1.7} className={active ? "text-clay" : "text-faint group-hover:text-muted"} />
              <span className="flex-1">{item.label}</span>
              {active && <span className="h-1 w-1 rounded-full bg-clay" />}
            </button>
          );
        })}
      </nav>

      <div className="mx-3 mt-6 rounded-xl border border-line/70 bg-card/55 p-3.5">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-medium tracking-[0.12em] text-faint">TRIP HEALTH</span>
          <span className="flex items-center gap-1 text-[10px] text-moss">
            <span className="h-1.5 w-1.5 rounded-full bg-moss" /> good
          </span>
        </div>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-line/60">
          <div className="h-full rounded-full bg-moss/70" style={{ width: `${Math.min(100, (spent / budget) * 100)}%` }} />
        </div>
        <div className="mt-2 flex items-center justify-between text-[10px] text-muted">
          <span>{formatYen(left)} left</span>
          <span>{Math.round((spent / budget) * 100)}%</span>
        </div>
        <div className="mt-3 flex items-start gap-2 border-t border-line/50 pt-2.5 text-[10px] leading-relaxed text-muted">
          <CircleAlert size={12} className="mt-0.5 shrink-0 text-sun" />
          <span>Day 5 ends late before an early Uji train.</span>
        </div>
      </div>

      <div className="mt-auto px-3 pb-4">
        <button
          onClick={onWander}
          className="flex w-full items-center gap-2.5 rounded-xl border border-clay/20 bg-clay-soft/45 p-3 text-left transition hover:bg-clay-soft/70"
        >
          <div className="grid h-8 w-8 place-items-center rounded-full bg-clay text-white">
            <Sparkles size={14} />
          </div>
          <div className="min-w-0">
            <div className="text-[11px] font-medium text-ink">Ask Wander</div>
            <div className="mt-0.5 flex items-center gap-1 text-[9px] text-clay/80">
              <span className={`h-1.5 w-1.5 rounded-full ${agentOnline ? "bg-moss" : "bg-sun"}`} /> {agentOnline ? "Managed Agent · live" : "Local fallback"}
            </div>
          </div>
        </button>
        <div className="mt-3 flex items-center gap-2 px-1">
          <div className="grid h-6 w-6 place-items-center rounded-full bg-[#d7c3ae] text-[9px] font-medium text-[#5f4936]">CC</div>
          <span className="text-[10px] text-faint">Private trip · only you two</span>
        </div>
      </div>
    </aside>
  );
}
