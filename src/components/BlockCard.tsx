import type { CSSProperties } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Clock3, GripVertical, Lock } from "lucide-react";
import { formatYen, kindMeta } from "../data";
import type { Block } from "../types";
import { KindIcon } from "./KindIcon";

export function BlockCard({
  block,
  onSelect,
}: {
  block: Block;
  onSelect: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: block.id,
  });
  const meta = kindMeta[block.kind];
  // Only dnd-kit owns `transform`; the hover lift lives on the `translate`
  // property in CSS so the two never fight. will-change is scoped to the drag.
  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    // dnd-kit hands back `transform linear` even at rest; applying that would
    // stomp the CSS hover transition, so only pass it while a shift is live.
    transition: !isDragging && transform ? transition : undefined,
    willChange: isDragging ? "transform" : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      data-dragging={isDragging ? "true" : "false"}
      onClick={() => onSelect(block.id)}
      className="block-card group relative cursor-pointer overflow-hidden rounded-xl border border-black/10 bg-white px-3 py-3 text-left shadow-[0_1px_2px_rgba(0,0,0,0.05),0_2px_8px_rgba(0,0,0,0.08)] transition-[translate,border-color,opacity] duration-150 hover:border-black/20"
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect(block.id);
        }
      }}
    >
      <div className="flex items-start justify-between gap-1.5">
        <div className="flex items-center gap-1.5 text-[11px] font-medium text-[#6d6b67]">
          <KindIcon kind={block.kind} size={12} className="text-[#8a8a8a]" />
          <span className="uppercase tracking-[0.05em]">{meta.label}</span>
        </div>
        {block.locked ? (
          <span className="flex items-center gap-1 text-[11px] text-[#6d6b67]" title="Booked — locked">
            <Lock size={11} /> booked
          </span>
        ) : (
          <button
            {...listeners}
            onClick={(event) => event.stopPropagation()}
            className="block-card-grip -mr-1 -mt-1 grid h-6 w-6 cursor-grab touch-none place-items-center rounded-md text-[#8a8a8a] hover:bg-black/[.04] hover:text-ink active:cursor-grabbing"
            aria-label={`Reorder ${block.title}`}
            title="Drag to move"
          >
            <GripVertical size={13} />
          </button>
        )}
      </div>

      <div className="mt-2 flex items-center gap-1.5 text-[12px] tabular-nums text-[#525252]">
        <Clock3 size={11} className="text-[#8a8a8a]" />
        <span>{block.start}</span>
        <span className="text-black/20">·</span>
        <span>{block.duration} min</span>
      </div>
      <h4 className="mt-1.5 text-[14px] font-medium leading-[1.3] tracking-[-0.01em] text-ink">{block.title}</h4>
      <p className="mt-1 line-clamp-2 text-[12px] leading-4 text-[#525252]">{block.place}</p>
      <div className="mt-2.5 flex items-center justify-between border-t border-black/[.06] pt-2 text-[11px]">
        <span className="text-[#6d6b67]">{block.cost > 0 ? formatYen(block.cost) : "no cost"}</span>
        <span className="rounded-full bg-black/[.04] px-1.5 py-0.5 text-[11px] text-[#525252]">
          {block.kind === "travel" ? "transit" : block.kind === "reset" ? "protected" : "planned"}
        </span>
      </div>
    </div>
  );
}
