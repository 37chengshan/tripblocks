import { useLayoutEffect, useRef, useState } from "react";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import { ArrowUpRight, ChevronLeft, ChevronRight, Globe2, Plus, Sparkles } from "lucide-react";
import { cityMeta, formatYen } from "../data";
import type { Block, Day, Trip } from "../types";
import { BlockCard } from "./BlockCard";

/** px of slack for "the scroller is at an edge" (sub-pixel layout, zoom). */
const EDGE_TOLERANCE = 2;
const SCROLL_STEP = 560;

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
    <section className="flex w-[224px] shrink-0 flex-col border-l border-black/10 px-3 first:border-l-0 first:pl-0 xl:w-[232px]">
      <div className="flex min-h-[76px] items-start justify-between pb-3 pt-1">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-medium tracking-[0.1em] text-[#6d6b67]">
            <span>DAY {String(day.id).padStart(2, "0")}</span>
            <span className="h-px w-3 bg-black/10" />
            <span className="normal-case tracking-normal text-[#6d6b67]">{day.label}</span>
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <h3 className="text-[26px] font-semibold leading-none tracking-[-0.02em] text-ink">{day.date}</h3>
            <span className="text-[11px] tracking-[0.1em] text-[#6d6b67]">{day.month}</span>
          </div>
          <div className="mt-1.5 flex min-w-0 items-center gap-1.5">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#8a8a8a]" />
            <span className="text-[12px] text-[#525252]">{meta.name}</span>
            <span className="truncate text-[11px] text-[#6d6b67]">· {day.title}</span>
          </div>
        </div>
        <div className="shrink-0 pt-0.5 text-right text-[11px] leading-4 text-[#6d6b67]">
          <div className="tabular-nums text-[#525252]">{Math.round(totalMinutes / 60)}h planned</div>
          <div className="tabular-nums">{dayCost ? formatYen(dayCost) : "free"}</div>
        </div>
      </div>

      <div
        ref={setNodeRef}
        className={`flex min-h-[220px] flex-1 flex-col gap-2 rounded-[10px] pb-2 ${
          isOver ? "bg-clay/[.04] ring-1 ring-inset ring-clay/25" : ""
        }`}
      >
        <SortableContext items={blocks.map((block) => block.id)} strategy={verticalListSortingStrategy}>
          {blocks.map((block) => (
            <BlockCard key={block.id} block={block} onSelect={onSelect} />
          ))}
        </SortableContext>
        {blocks.length === 0 && (
          <div
            className={`flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed px-4 py-8 text-center ${
              isOver ? "border-clay/40 text-clay-deep" : "border-black/15 text-[#6d6b67]"
            }`}
          >
            <Sparkles size={15} className="mb-2 opacity-60" />
            <p className="text-[12px] leading-5">
              A little breathing room.
              <br />
              Drop a block here.
            </p>
          </div>
        )}
        <button
          onClick={() => onAdd(day.id)}
          className="group mt-auto flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-black/15 py-2 text-[11px] text-[#6d6b67] transition-colors duration-150 hover:border-clay/40 hover:bg-black/[.02] hover:text-clay-deep"
        >
          <Plus size={12} /> Add a block
        </button>
        <button
          onClick={() =>
            onAsk(
              `What would you add or remove on Day ${day.id} (${day.label} ${day.date}, ${meta.name}) to keep the pace slow and interesting?`,
            )
          }
          className="flex items-center justify-center gap-1 text-[11px] text-[#6d6b67] transition-colors duration-150 hover:text-clay-deep"
        >
          <ArrowUpRight size={11} /> ask Wander about this day
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
  const [edges, setEdges] = useState({ start: true, end: false });

  // Measure overflow edges once per layout, then on scroll/resize. Reads happen
  // in a rAF, never during render, and state only changes when an edge flips.
  useLayoutEffect(() => {
    const node = scroller.current;
    if (!node) return;
    let frame = 0;

    const measure = () => {
      frame = 0;
      const max = node.scrollWidth - node.clientWidth;
      const start = node.scrollLeft <= EDGE_TOLERANCE;
      const end = max <= EDGE_TOLERANCE || node.scrollLeft >= max - EDGE_TOLERANCE;
      setEdges((prev) => (prev.start === start && prev.end === end ? prev : { start, end }));
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };

    measure();
    node.addEventListener("scroll", schedule, { passive: true });

    const observer = typeof ResizeObserver !== "undefined" ? new ResizeObserver(schedule) : null;
    observer?.observe(node);
    if (node.firstElementChild) observer?.observe(node.firstElementChild);

    return () => {
      node.removeEventListener("scroll", schedule);
      observer?.disconnect();
      if (frame) cancelAnimationFrame(frame);
    };
  }, [trip.days.length]);

  const scrollBoard = (direction: -1 | 1) => {
    scroller.current?.scrollBy({
      left: direction * SCROLL_STEP,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
    });
  };

  const arrowClass =
    "grid h-6 w-6 place-items-center rounded-md text-[#6d6b67] transition-colors duration-150 hover:bg-black/5 hover:text-ink disabled:pointer-events-none disabled:opacity-30";

  return (
    <div className="animate-in bg-[#fcfcfb]">
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-black/10 px-4 py-3 md:px-5">
        <div>
          <div className="text-[11px] font-medium tracking-[0.12em] text-[#6d6b67]">THE PLAN, IN PIECES</div>
          <h2 className="mt-0.5 text-[18px] font-semibold leading-6 tracking-[-0.01em] text-ink">
            Your week, block by block
          </h2>
          <div
            data-visible={edges.end ? "false" : "true"}
            aria-hidden="true"
            className="tripboard-hint mt-1 flex items-center gap-1 text-[11px] text-[#6d6b67] sm:hidden"
          >
            Swipe for all 7 days <ChevronRight size={11} />
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="hidden items-center rounded-lg border border-black/10 bg-white p-0.5 sm:flex">
            <button
              onClick={() => scrollBoard(-1)}
              disabled={edges.start}
              className={arrowClass}
              aria-label="Scroll plan left"
            >
              <ChevronLeft size={13} />
            </button>
            <span className="px-1.5 text-[11px] tabular-nums text-[#6d6b67]">7 days</span>
            <button
              onClick={() => scrollBoard(1)}
              disabled={edges.end}
              className={arrowClass}
              aria-label="Scroll plan right"
            >
              <ChevronRight size={13} />
            </button>
          </div>
          <button
            onClick={onFlyAI}
            className="flex h-7 items-center gap-1.5 rounded-lg bg-clay-deep px-2.5 text-[11px] font-medium text-white transition-colors duration-150 hover:bg-[#a34a2a]"
          >
            <Globe2 size={12} /> Live options
          </button>
          <button
            onClick={() =>
              onAsk(
                "Look at the whole trip. What is the one change that would make it feel calmer without losing anything good?",
              )
            }
            className="hidden h-7 items-center gap-1.5 rounded-lg border border-black/10 bg-white px-2.5 text-[11px] text-[#525252] transition-colors duration-150 hover:border-black/20 hover:text-ink sm:flex"
          >
            <Sparkles size={12} /> Sanity check
          </button>
        </div>
      </div>

      <div className="relative">
        <div
          ref={scroller}
          data-at-start={edges.start ? "true" : "false"}
          data-at-end={edges.end ? "true" : "false"}
          tabIndex={0}
          role="region"
          aria-label="Trip plan by day — scrolls horizontally"
          className="tripboard-scroller scroll-fade-x overflow-x-auto px-4 pb-8 pt-4 md:px-5"
        >
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
            <div className="ml-4 flex w-[180px] shrink-0 flex-col justify-center rounded-xl border border-dashed border-black/15 bg-white p-4">
              <div className="text-[14px] font-semibold leading-5 text-[#525252]">Room to wander.</div>
              <p className="mt-1.5 text-[11px] leading-4 text-[#6d6b67]">
                The empty spaces are part of the itinerary. Keep one afternoon free.
              </p>
              <div className="mt-3 h-px w-8 bg-black/10" />
              <p className="mt-2.5 text-[11px] leading-4 text-[#6d6b67]">
                Tip: drag a block to another day. Times stay yours.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
