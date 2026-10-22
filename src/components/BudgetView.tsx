import { ArrowRight, CircleAlert, Sparkles, Wallet } from "lucide-react";
import { cityMeta, formatYen, kindMeta } from "../data";
import type { BlockKind, Trip } from "../types";
import { KindIcon } from "./KindIcon";

export function BudgetView({ trip, onAsk }: { trip: Trip; onAsk: (prompt: string) => void }) {
  const spent = trip.blocks.reduce((sum, block) => sum + block.cost, 0);
  const remaining = trip.budget - spent;
  const percent = Math.min(100, Math.round((spent / trip.budget) * 100));
  const kinds = (Object.keys(kindMeta) as BlockKind[]).map((kind) => ({
    kind,
    amount: trip.blocks.filter((block) => block.kind === kind).reduce((sum, block) => sum + block.cost, 0),
  })).sort((a, b) => b.amount - a.amount);

  return (
    <div className="animate-in px-4 py-5 md:px-7">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="text-[10px] font-medium tracking-[0.16em] text-faint">THE MONEY</div>
          <h2 className="mt-1 font-display text-[32px] leading-none">Enough for the good bits<span className="text-clay">.</span></h2>
          <p className="mt-2 max-w-md text-[11.5px] leading-relaxed text-muted">One shared budget for two. Booked things are counted; the rest is an honest estimate.</p>
        </div>
        <button
          onClick={() => onAsk("Where can we cut about ¥300 (or 30,000 JPY) without losing the tea ceremony or the good dinners?")}
          className="flex items-center gap-1.5 rounded-full border border-line bg-card/55 px-3 py-1.5 text-[10.5px] text-muted transition hover:border-clay/30 hover:text-clay"
        >
          <Sparkles size={12} /> Ask where to trim
        </button>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[1.1fr_.9fr]">
        <div className="rounded-2xl border border-line/80 bg-card/55 p-5">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-1.5 text-[9px] tracking-[0.14em] text-faint"><Wallet size={11} /> TOTAL BUDGET</div>
              <div className="mt-2 font-display text-[48px] leading-none tabular-nums">{formatYen(spent)}</div>
              <div className="mt-1 text-[10px] text-muted">of {formatYen(trip.budget)} · for {trip.travelers} people</div>
            </div>
            <div className="rounded-full bg-moss-soft px-2.5 py-1 text-[9px] text-moss">{percent}% used</div>
          </div>
          <div className="mt-5 h-2 overflow-hidden rounded-full bg-line/60">
            <div className="h-full rounded-full bg-gradient-to-r from-clay to-[#d39a70]" style={{ width: `${percent}%` }} />
          </div>
          <div className="mt-2 flex items-center justify-between text-[10px]">
            <span className="text-muted">{formatYen(remaining)} left for the unexpected</span>
            <span className="text-faint">≈ {formatYen(Math.round(remaining / trip.travelers))} / person</span>
          </div>

          <div className="mt-7 space-y-3.5">
            <div className="text-[9px] font-medium tracking-[0.14em] text-faint">WHERE IT GOES</div>
            {kinds.map(({ kind, amount }) => {
              const meta = kindMeta[kind];
              return (
                <div key={kind}>
                  <div className="flex items-center justify-between text-[10.5px]">
                    <span className="flex items-center gap-2 text-ink/85"><KindIcon kind={kind} size={12} className="text-faint" /> {meta.label}</span>
                    <span className="tabular-nums text-muted">{formatYen(amount)}</span>
                  </div>
                  <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-line/45">
                    <div className="h-full rounded-full" style={{ width: `${Math.max(2, (amount / Math.max(1, spent)) * 100)}%`, background: meta.tone }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="rounded-2xl border border-sun/25 bg-sun-soft/40 p-4">
            <div className="flex items-center gap-1.5 text-[9px] font-medium tracking-[0.12em] text-[#886a36]"><CircleAlert size={11} /> ONE LOOSE END</div>
            <h3 className="mt-2 text-[12px] font-medium text-[#5e4b2e]">The kaiseki is 7% of the trip.</h3>
            <p className="mt-1.5 text-[10.5px] leading-relaxed text-[#7b6747]">It is worth it once. If you want a softer landing, turn it into a long lunch and move the savings to the tea ceremony.</p>
            <button
              onClick={() => onAsk("Should we keep the kaiseki dinner or swap it for a long lunch? What do we actually gain?")}
              className="mt-3 flex items-center gap-1.5 text-[10px] text-[#7a5b28] transition hover:text-[#4e3a1b]"
            >
              Talk it through <ArrowRight size={11} />
            </button>
          </div>

          <div className="flex-1 rounded-2xl border border-line/80 bg-card/55 p-4">
            <div className="flex items-center justify-between">
              <div className="text-[9px] font-medium tracking-[0.14em] text-faint">BY DAY</div>
              <div className="text-[9px] text-faint">shared</div>
            </div>
            <div className="mt-3 space-y-2.5">
              {trip.days.map((day) => {
                const blocks = trip.blocks.filter((block) => block.dayId === day.id);
                const amount = blocks.reduce((sum, block) => sum + block.cost, 0);
                return (
                  <div key={day.id} className="flex items-center gap-2.5 text-[10px]">
                    <span className="w-4 tabular-nums text-faint">{String(day.id).padStart(2, "0")}</span>
                    <span className="w-10 text-muted">{cityMeta[day.city].name.slice(0, 5)}</span>
                    <div className="h-1 flex-1 overflow-hidden rounded-full bg-line/45">
                      <div className="h-full rounded-full bg-ink/45" style={{ width: `${Math.max(2, (amount / Math.max(1, spent)) * 100)}%` }} />
                    </div>
                    <span className="w-14 text-right tabular-nums text-muted">{amount ? formatYen(amount) : "—"}</span>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 border-t border-line/60 pt-3 text-[9px] leading-relaxed text-faint">Excludes flights. Includes six nights, rail, food, and the booked tea ceremony.</div>
          </div>
        </div>
      </div>
    </div>
  );
}
