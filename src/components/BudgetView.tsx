import { ArrowRight, CircleAlert, Sparkles, Wallet } from "lucide-react";
import { cityMeta, formatYen, kindMeta } from "../data";
import type { BlockKind, Trip } from "../types";
import { KindIcon } from "./KindIcon";

export function BudgetView({ trip, onAsk }: { trip: Trip; onAsk: (prompt: string) => void }) {
  const spent = trip.blocks.reduce((sum, block) => sum + block.cost, 0);
  const remaining = trip.budget - spent;
  const percent = Math.min(100, Math.round((spent / trip.budget) * 100));
  const kinds = (Object.keys(kindMeta) as BlockKind[])
    .map((kind) => ({
      kind,
      amount: trip.blocks.filter((block) => block.kind === kind).reduce((sum, block) => sum + block.cost, 0),
    }))
    .sort((a, b) => b.amount - a.amount);

  return (
    <div className="animate-in bg-[#fcfcfb] px-4 py-4 md:px-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="text-[11px] font-medium tracking-[0.12em] text-[#6d6b67]">THE MONEY</div>
          <h2 className="mt-0.5 text-[20px] font-semibold leading-6 tracking-[-0.01em] text-ink">
            Enough for the good bits
          </h2>
          <p className="mt-1 max-w-md text-[12px] leading-5 text-[#525252]">
            One shared budget for two. Booked things are counted; the rest is an honest estimate.
          </p>
        </div>
        <button
          onClick={() =>
            onAsk(
              "Where can we cut about ¥300 (or 30,000 JPY) without losing the tea ceremony or the good dinners?",
            )
          }
          className="flex h-7 items-center gap-1.5 rounded-lg border border-black/10 bg-white px-2.5 text-[11px] text-[#525252] transition-colors duration-150 hover:border-black/20 hover:text-ink"
        >
          <Sparkles size={12} /> Ask where to trim
        </button>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1.1fr_.9fr]">
        <div className="rounded-xl border border-black/10 bg-white p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 text-[11px] tracking-[0.1em] text-[#6d6b67]">
                <Wallet size={12} /> TOTAL SPENT
              </div>
              <div className="mt-2 text-[36px] font-semibold leading-none tracking-[-0.02em] tabular-nums text-ink">
                {formatYen(spent)}
              </div>
              <div className="mt-1.5 text-[12px] text-[#525252]">
                of {formatYen(trip.budget)} · for {trip.travelers} people
              </div>
            </div>
            <div className="shrink-0 rounded-full bg-black/[.05] px-2.5 py-1 text-[11px] tabular-nums text-[#525252]">
              {percent}% used
            </div>
          </div>
          <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-black/[.06]">
            <div className="h-full rounded-full bg-clay" style={{ width: `${percent}%` }} />
          </div>
          <div className="mt-2 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-[11px]">
            <span className="text-[#525252]">{formatYen(remaining)} left for the unexpected</span>
            <span className="text-[#6d6b67]">
              ≈ {formatYen(Math.round(remaining / trip.travelers))} / person
            </span>
          </div>

          <div className="mt-6 space-y-3.5">
            <div className="text-[11px] font-medium tracking-[0.1em] text-[#6d6b67]">WHERE IT GOES</div>
            {kinds.map(({ kind, amount }) => {
              const meta = kindMeta[kind];
              return (
                <div key={kind}>
                  <div className="flex items-center justify-between text-[12px]">
                    <span className="flex items-center gap-2 text-ink">
                      <KindIcon kind={kind} size={12} className="text-[#6d6b67]" /> {meta.label}
                    </span>
                    <span className="tabular-nums text-[#525252]">{formatYen(amount)}</span>
                  </div>
                  <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-black/[.05]">
                    <div
                      className="h-full rounded-full bg-black/30"
                      style={{ width: `${Math.max(2, (amount / Math.max(1, spent)) * 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="rounded-xl border border-black/10 bg-white p-4">
            <div className="flex items-center gap-1.5 text-[11px] font-medium tracking-[0.1em] text-clay-deep">
              <CircleAlert size={12} /> ONE LOOSE END
            </div>
            <h3 className="mt-2 text-[14px] font-medium leading-5 text-ink">
              The kaiseki is 7% of the trip.
            </h3>
            <p className="mt-1.5 text-[12px] leading-5 text-[#525252]">
              It is worth it once. If you want a softer landing, turn it into a long lunch and move the savings to
              the tea ceremony.
            </p>
            <button
              onClick={() =>
                onAsk("Should we keep the kaiseki dinner or swap it for a long lunch? What do we actually gain?")
              }
              className="mt-3 flex items-center gap-1.5 text-[12px] text-clay-deep transition-colors duration-150 hover:text-ink"
            >
              Talk it through <ArrowRight size={12} />
            </button>
          </div>

          <div className="flex-1 rounded-xl border border-black/10 bg-white p-4">
            <div className="flex items-center justify-between">
              <div className="text-[11px] font-medium tracking-[0.1em] text-[#6d6b67]">BY DAY</div>
              <div className="text-[11px] text-[#6d6b67]">shared</div>
            </div>
            <div className="mt-3 space-y-2.5">
              {trip.days.map((day) => {
                const blocks = trip.blocks.filter((block) => block.dayId === day.id);
                const amount = blocks.reduce((sum, block) => sum + block.cost, 0);
                return (
                  <div key={day.id} className="flex items-center gap-2.5 text-[12px]">
                    <span className="w-4 tabular-nums text-[#6d6b67]">{String(day.id).padStart(2, "0")}</span>
                    <span className="w-11 truncate text-[#525252]">{cityMeta[day.city].name}</span>
                    <div className="h-1 flex-1 overflow-hidden rounded-full bg-black/[.05]">
                      <div
                        className="h-full rounded-full bg-black/30"
                        style={{ width: `${Math.max(2, (amount / Math.max(1, spent)) * 100)}%` }}
                      />
                    </div>
                    <span className="w-14 text-right tabular-nums text-[#6d6b67]">
                      {amount ? formatYen(amount) : "—"}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 border-t border-black/[.06] pt-3 text-[11px] leading-4 text-[#6d6b67]">
              Excludes flights. Includes six nights, rail, food, and the booked tea ceremony.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
