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
    borderColor: meta.border,
    background: `linear-gradient(180deg, #fffdf8 0%, ${meta.soft} 145%)`,
    willChange: isDragging ? "transform" : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      data-dragging={isDragging ? "true" : "false"}
      onClick={() => onSelect(block.id)}
      className="block-card group relative cursor-pointer overflow-hidden rounded-[13px] border px-3 py-3 text-left"
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect(block.id);
        }
      }}
    >
      <span className="absolute inset-y-0 left-0 w-[2.5px]" style={{ background: meta.tone }} />
      <div className="flex items-start justify-between gap-1.5 pl-1">
        <div className="flex items-center gap-1.5 text-[9px] font-medium tracking-[0.06em]" style={{ color: meta.tone }}>
          <KindIcon kind={block.kind} size={12} />
          <span className="uppercase">{meta.label}</span>
        </div>
        {block.locked ? (
          <span className="flex items-center gap-1 text-[9px] text-faint" title="Booked — locked">
            <Lock size={10} /> booked
          </span>
        ) : (
          <button
            {...listeners}
            onClick={(event) => event.stopPropagation()}
            className="block-card-grip -mr-1 -mt-1 grid h-6 w-6 cursor-grab touch-none place-items-center rounded-md text-faint/50 hover:bg-black/[.045] hover:text-muted active:cursor-grabbing"
            aria-label={`Reorder ${block.title}`}
            title="Drag to move"
          >
            <GripVertical size={13} />
          </button>
        )}
      </div>

      <div className="mt-2 flex items-center gap-1.5 text-[10px] tabular-nums text-muted">
        <Clock3 size={10} className="text-faint" />
        <span>{block.start}</span>
        <span className="text-line">·</span>
        <span>{block.duration} min</span>
      </div>
      <h4 className="mt-1.5 text-[13px] font-medium leading-[1.3] tracking-[-0.01em] text-ink">{block.title}</h4>
      <p className="mt-1 line-clamp-2 text-[10.5px] leading-relaxed text-muted/90">{block.place}</p>
      <div className="mt-2.5 flex items-center justify-between border-t border-black/[.055] pt-2 text-[10px]">
        <span className="text-faint">{block.cost > 0 ? formatYen(block.cost) : "no cost"}</span>
        <span className="rounded-full px-1.5 py-0.5 text-[9px]" style={{ color: meta.tone, background: "rgba(255,255,255,.48)" }}>
          {block.kind === "travel" ? "transit" : block.kind === "reset" ? "protected" : "planned"}
        </span>
      </div>
    </div>
  );
}
