import { useRef } from "react";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import { ArrowUpRight, ChevronLeft, ChevronRight, Globe2, Plus, Sparkles } from "lucide-react";
import { cityMeta, formatYen } from "../data";
import type { Block, Day, Trip } from "../types";
import { BlockCard } from "./BlockCard";

function DayColumn({
  day,
  blocks,
  onAdd,
  onSelect,
  onAsk,
}: {
  day: Day;
  blocks: Block[];
  onAdd: (dayId: number) => void;
  onSelect: (id: string) => void;
  onAsk: (prompt: string) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: `day-${day.id}` });
  const meta = cityMeta[day.city];
  const dayCost = blocks.reduce((sum, block) => sum + block.cost, 0);
  const totalMinutes = blocks.reduce((sum, block) => sum + block.duration, 0);

  return (
    <section className="flex w-[224px] shrink-0 flex-col border-l border-line/55 px-3 first:border-l-0 first:pl-0 xl:w-[232px]">
      <div className="flex min-h-[72px] items-start justify-between pb-3 pt-1">
        <div>
          <div className="flex items-center gap-2 text-[9px] font-medium tracking-[0.16em] text-faint">
            <span>DAY {String(day.id).padStart(2, "0")}</span>
            <span className="h-px w-3 bg-line" />
            <span className="normal-case tracking-[0.08em] text-muted">{day.label}</span>
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <h3 className="font-display text-[30px] leading-none">{day.date}</h3>
            <span className="text-[9px] tracking-[0.14em] text-faint">{day.month}</span>
          </div>
          <div className="mt-1.5 flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: meta.ink }} />
            <span className="text-[10px] text-muted">{meta.name}</span>
            <span className="text-[9px] text-faint">· {day.title}</span>
          </div>
        </div>
        <div className="pt-0.5 text-right text-[9px] leading-relaxed text-faint">
          <div className="tabular-nums text-muted">{Math.round(totalMinutes / 60)}h planned</div>
          <div className="tabular-nums">{dayCost ? formatYen(dayCost) : "free"}</div>
        </div>
      </div>

      <div
        ref={setNodeRef}
        className={`flex min-h-[220px] flex-1 flex-col gap-2 rounded-lg pb-2 transition ${
          isOver ? "bg-clay/[.045] ring-1 ring-inset ring-clay/20" : ""
        }`}
      >
        <SortableContext items={blocks.map((block) => block.id)} strategy={verticalListSortingStrategy}>
          {blocks.map((block) => (
            <BlockCard key={block.id} block={block} onSelect={onSelect} />
          ))}
        </SortableContext>
        {blocks.length === 0 && (
          <div className={`flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed px-4 py-8 text-center transition ${
            isOver ? "border-clay/40 text-clay" : "border-line text-faint"
          }`}>
            <Sparkles size={15} className="mb-2 opacity-60" />
            <p className="text-[10.5px] leading-relaxed">A little breathing room.<br />Drop a block here.</p>
          </div>
        )}
        <button
          onClick={() => onAdd(day.id)}
          className="group mt-auto flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-line/80 py-2 text-[10px] text-faint transition hover:border-clay/35 hover:bg-card/45 hover:text-clay"
        >
          <Plus size={12} /> Add a block
        </button>
        <button
          onClick={() => onAsk(`What would you add or remove on Day ${day.id} (${day.label} ${day.date}, ${meta.name}) to keep the pace slow and interesting?`)}
          className="flex items-center justify-center gap-1 text-[9px] text-faint/80 transition hover:text-clay"
        >
          <ArrowUpRight size={10} /> ask Wander about this day
        </button>
      </div>
    </section>
  );
}

export function TripBoard({
  trip,
  onAdd,
  onSelect,
  onAsk,
  onFlyAI,
}: {
  trip: Trip;
  onAdd: (dayId: number) => void;
  onSelect: (id: string) => void;
  onAsk: (prompt: string) => void;
  onFlyAI: () => void;
}) {
  const scroller = useRef<HTMLDivElement>(null);
  return (
    <div className="animate-in">
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-line/60 px-4 py-4 md:px-7">
        <div>
          <div className="text-[10px] font-medium tracking-[0.16em] text-faint">THE PLAN, IN PIECES</div>
          <h2 className="mt-1 font-display text-[26px] leading-none">Your week, block by block</h2>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden items-center rounded-full border border-line bg-card/45 p-0.5 sm:flex">
            <button
              onClick={() => scroller.current?.scrollBy({ left: -560, behavior: "smooth" })}
              className="grid h-6 w-6 place-items-center rounded-full text-faint transition hover:bg-paper hover:text-ink"
              aria-label="Scroll plan left"
            >
              <ChevronLeft size={13} />
            </button>
            <span className="px-1 text-[8.5px] tracking-[0.08em] text-faint">7 days</span>
            <button
              onClick={() => scroller.current?.scrollBy({ left: 560, behavior: "smooth" })}
              className="grid h-6 w-6 place-items-center rounded-full text-faint transition hover:bg-paper hover:text-ink"
              aria-label="Scroll plan right"
            >
              <ChevronRight size={13} />
            </button>
          </div>
          <button
            onClick={onFlyAI}
            className="flex items-center gap-1.5 rounded-full bg-clay px-3 py-1.5 text-[10.5px] font-medium text-white transition hover:bg-[#a95034]"
          >
            <Globe2 size={12} /> Live options
          </button>
          <button
            onClick={() => onAsk("Look at the whole trip. What is the one change that would make it feel calmer without losing anything good?")}
            className="hidden items-center gap-1.5 rounded-full border border-line bg-card/55 px-3 py-1.5 text-[10.5px] text-muted transition hover:border-clay/30 hover:text-clay sm:flex"
          >
            <Sparkles size={12} /> Sanity check
          </button>
        </div>
      </div>

      <div ref={scroller} className="overflow-x-auto px-4 pb-8 pt-4 md:px-7">
        <div className="flex min-w-max items-stretch">
          {trip.days.map((day) => (
            <DayColumn
              key={day.id}
              day={day}
              blocks={trip.blocks
                .filter((block) => block.dayId === day.id)
                .sort((a, b) => a.start.localeCompare(b.start))}
              onAdd={onAdd}
              onSelect={onSelect}
              onAsk={onAsk}
            />
          ))}
          <div className="ml-4 flex w-[170px] shrink-0 flex-col justify-center rounded-xl border border-dashed border-line/80 bg-card/25 p-4">
            <div className="font-display text-[23px] leading-tight text-muted">Room to wander.</div>
            <p className="mt-2 text-[10px] leading-relaxed text-faint">The empty spaces are part of the itinerary. Keep one afternoon free.</p>
            <div className="mt-4 h-px w-8 bg-line" />
            <p className="mt-3 text-[9px] leading-relaxed text-faint">Tip: drag a block to another day. Times stay yours.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
