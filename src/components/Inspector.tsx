import { useEffect, useState } from "react";
import { ArrowLeft, CalendarDays, Check, Clock3, Lock, MapPin, Trash2, X } from "lucide-react";
import { kindMeta } from "../data";
import { useDialogFocus } from "../lib/useDialogFocus";
import type { Block, BlockKind } from "../types";
import { KindIcon } from "./KindIcon";

const kinds: BlockKind[] = ["explore", "food", "travel", "stay", "reset"];

const inputClass =
  "w-full rounded-[10px] border border-black/10 bg-white px-3 py-2.5 text-[14px] leading-5 text-ink outline-none transition-colors duration-150 placeholder:text-[#8a8a8a] focus:border-clay/60";
const labelClass = "mb-1.5 block text-[11px] font-medium tracking-[0.1em] text-[#6d6b67]";

export function Inspector({
  block,
  dayLabel,
  onClose,
  onSave,
  onDelete,
}: {
  block: Block;
  dayLabel: string;
  onClose: () => void;
  onSave: (block: Block) => void;
  onDelete: (id: string) => void;
}) {
  const [draft, setDraft] = useState(block);
  const panelRef = useDialogFocus<HTMLElement>(onClose);

  useEffect(() => {
    setDraft(block);
  }, [block]);

  const set = <K extends keyof Block>(key: K, value: Block[K]) =>
    setDraft((prev) => ({ ...prev, [key]: value }));

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button aria-label="Close details" className="absolute inset-0 bg-black/20" onClick={onClose} />
      <aside
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Block details"
        className="animate-in relative flex h-full w-full flex-col border-l border-black/10 bg-white shadow-[0_8px_24px_rgba(0,0,0,0.12)] sm:w-[400px]"
      >
        <div className="flex items-center justify-between border-b border-black/10 px-5 py-3.5">
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 text-[12px] text-[#525252] transition-colors duration-150 hover:text-ink"
          >
            <ArrowLeft size={13} /> Back to plan
          </button>
          <button
            onClick={onClose}
            className="grid h-7 w-7 place-items-center rounded-lg text-[#6d6b67] transition-colors duration-150 hover:bg-black/5 hover:text-ink"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5">
          <div className="flex items-center gap-2 text-[11px] font-medium tracking-[0.12em] text-[#6d6b67]">
            <span>BLOCK DETAILS</span>
            {block.locked && (
              <span className="flex items-center gap-1 rounded-full bg-black/[.05] px-1.5 py-0.5 text-[11px] tracking-normal text-[#525252]">
                <Lock size={10} /> booked
              </span>
            )}
          </div>
          <h2 className="mt-2 text-[20px] font-semibold leading-7 tracking-[-0.01em] text-ink">
            {draft.title || "Untitled block"}
          </h2>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] text-[#525252]">
            <CalendarDays size={12} className="text-[#8a8a8a]" /> {dayLabel}
            <span className="text-black/20">·</span>
            <Clock3 size={12} className="text-[#8a8a8a]" /> {draft.start} · {draft.duration} min
          </div>

          <div className="mt-6">
            <div className={labelClass}>TYPE</div>
            <div className="flex flex-wrap gap-1.5">
              {kinds.map((kind) => {
                const meta = kindMeta[kind];
                const active = draft.kind === kind;
                return (
                  <button
                    key={kind}
                    onClick={() => set("kind", kind)}
                    className={`flex h-8 items-center gap-1.5 rounded-lg border px-2.5 text-[12px] transition-colors duration-150 ${
                      active
                        ? "border-ink bg-ink text-white"
                        : "border-black/10 bg-white text-[#525252] hover:border-black/20 hover:text-ink"
                    }`}
                  >
                    <KindIcon kind={kind} size={12} />
                    {meta.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-5 space-y-4">
            <label className="block">
              <span className={labelClass}>WHAT</span>
              <input
                value={draft.title}
                onChange={(event) => set("title", event.target.value)}
                className={inputClass}
                placeholder="A name for this block"
              />
            </label>
            <label className="block">
              <span className={`flex items-center gap-1.5 ${labelClass}`}>
                <MapPin size={11} /> WHERE
              </span>
              <input
                value={draft.place}
                onChange={(event) => set("place", event.target.value)}
                className={inputClass}
                placeholder="Neighborhood, address or station"
              />
            </label>
            <div className="grid grid-cols-3 gap-2">
              <label className="block">
                <span className={labelClass}>START</span>
                <input
                  type="time"
                  value={draft.start}
                  onChange={(event) => set("start", event.target.value)}
                  className={`${inputClass} px-2 tabular-nums`}
                />
              </label>
              <label className="block">
                <span className={labelClass}>MIN</span>
                <input
                  type="number"
                  min={15}
                  step={15}
                  value={draft.duration}
                  onChange={(event) => set("duration", Number(event.target.value))}
                  className={`${inputClass} px-2 tabular-nums`}
                />
              </label>
              <label className="block">
                <span className={labelClass}>JPY</span>
                <input
                  type="number"
                  min={0}
                  step={100}
                  value={draft.cost}
                  onChange={(event) => set("cost", Number(event.target.value))}
                  className={`${inputClass} px-2 tabular-nums`}
                />
              </label>
            </div>
            <label className="block">
              <span className={labelClass}>A NOTE FOR LATER</span>
              <textarea
                value={draft.note}
                onChange={(event) => set("note", event.target.value)}
                rows={4}
                className={`${inputClass} resize-none leading-5`}
                placeholder="The tiny details that make it yours."
              />
            </label>
          </div>

          <div className="mt-6 rounded-[10px] border border-black/[.06] bg-[#fafafa] p-3 text-[11px] leading-4 text-[#6d6b67]">
            Changes are saved to this device. Wander sees the updated plan the next time you ask.
          </div>
        </div>

        <div className="flex items-center gap-2 border-t border-black/10 px-5 py-3.5">
          <button
            onClick={() => onDelete(block.id)}
            className="flex h-9 items-center gap-1.5 rounded-lg px-2.5 text-[12px] text-[#6d6b67] transition-colors duration-150 hover:bg-clay/10 hover:text-clay-deep"
          >
            <Trash2 size={13} /> Delete
          </button>
          <div className="flex-1" />
          <button
            onClick={onClose}
            className="h-9 rounded-lg px-3 text-[12px] text-[#525252] transition-colors duration-150 hover:bg-black/5 hover:text-ink"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(draft)}
            disabled={!draft.title.trim()}
            className="flex h-9 items-center gap-1.5 rounded-lg bg-ink px-3.5 text-[12px] font-medium text-white transition-colors duration-150 hover:bg-[#2c2c2a] disabled:opacity-40"
          >
            <Check size={13} /> Save block
          </button>
        </div>
      </aside>
    </div>
  );
}
