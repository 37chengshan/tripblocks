import { useEffect, useState } from "react";
import { ArrowLeft, CalendarDays, Check, Clock3, Lock, MapPin, Trash2, X } from "lucide-react";
import { kindMeta } from "../data";
import type { Block, BlockKind } from "../types";
import { KindIcon } from "./KindIcon";

const kinds: BlockKind[] = ["explore", "food", "travel", "stay", "reset"];

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

  useEffect(() => {
    setDraft(block);
  }, [block]);

  const set = <K extends keyof Block>(key: K, value: Block[K]) => setDraft((prev) => ({ ...prev, [key]: value }));

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button aria-label="Close details" className="absolute inset-0 bg-ink/20 backdrop-blur-[2px]" onClick={onClose} />
      <aside className="animate-in relative flex h-full w-full flex-col border-l border-line bg-card shadow-2xl sm:w-[390px]">
        <div className="flex items-center justify-between border-b border-line/70 px-5 py-4">
          <button onClick={onClose} className="flex items-center gap-1.5 text-[11px] text-muted transition hover:text-ink">
            <ArrowLeft size={13} /> Back to plan
          </button>
          <button onClick={onClose} className="rounded-full p-1.5 text-faint transition hover:bg-paper hover:text-ink" aria-label="Close">
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5">
          <div className="flex items-center gap-2 text-[9px] font-medium tracking-[0.16em] text-faint">
            <span>BLOCK DETAILS</span>
            {block.locked && (
              <span className="flex items-center gap-1 rounded-full bg-sun-soft px-1.5 py-0.5 text-[8px] tracking-normal text-[#87652d]">
                <Lock size={8} /> booked
              </span>
            )}
          </div>
          <h2 className="mt-2 font-display text-[32px] leading-[1.03]">{draft.title || "Untitled block"}</h2>
          <div className="mt-2 flex items-center gap-2 text-[11px] text-muted">
            <CalendarDays size={12} /> {dayLabel}
            <span className="text-line">·</span>
            <Clock3 size={12} /> {draft.start} · {draft.duration} min
          </div>

          <div className="mt-6">
            <div className="mb-2 text-[9px] font-medium tracking-[0.14em] text-faint">TYPE</div>
            <div className="flex flex-wrap gap-1.5">
              {kinds.map((kind) => {
                const meta = kindMeta[kind];
                const active = draft.kind === kind;
                return (
                  <button
                    key={kind}
                    onClick={() => set("kind", kind)}
                    className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-[10px] transition ${
                      active ? "border-ink/20 bg-ink text-paper" : "border-line bg-card text-muted hover:border-ink/20"
                    }`}
                  >
                    <KindIcon kind={kind} size={11} />
                    {meta.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-5 space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-[9px] font-medium tracking-[0.14em] text-faint">WHAT</span>
              <input
                value={draft.title}
                onChange={(event) => set("title", event.target.value)}
                className="w-full rounded-lg border border-line bg-paper/40 px-3 py-2.5 text-[12px] outline-none transition placeholder:text-faint focus:border-clay/50 focus:bg-white"
                placeholder="A name for this block"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 flex items-center gap-1.5 text-[9px] font-medium tracking-[0.14em] text-faint"><MapPin size={10} /> WHERE</span>
              <input
                value={draft.place}
                onChange={(event) => set("place", event.target.value)}
                className="w-full rounded-lg border border-line bg-paper/40 px-3 py-2.5 text-[12px] outline-none transition placeholder:text-faint focus:border-clay/50 focus:bg-white"
                placeholder="Neighborhood, address or station"
              />
            </label>
            <div className="grid grid-cols-3 gap-2">
              <label className="block">
                <span className="mb-1.5 block text-[9px] font-medium tracking-[0.14em] text-faint">START</span>
                <input
                  type="time"
                  value={draft.start}
                  onChange={(event) => set("start", event.target.value)}
                  className="w-full rounded-lg border border-line bg-paper/40 px-2.5 py-2.5 text-[11px] tabular-nums outline-none focus:border-clay/50 focus:bg-white"
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-[9px] font-medium tracking-[0.14em] text-faint">MIN</span>
                <input
                  type="number"
                  min={15}
                  step={15}
                  value={draft.duration}
                  onChange={(event) => set("duration", Number(event.target.value))}
                  className="w-full rounded-lg border border-line bg-paper/40 px-2.5 py-2.5 text-[11px] tabular-nums outline-none focus:border-clay/50 focus:bg-white"
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-[9px] font-medium tracking-[0.14em] text-faint">JPY</span>
                <input
                  type="number"
                  min={0}
                  step={100}
                  value={draft.cost}
                  onChange={(event) => set("cost", Number(event.target.value))}
                  className="w-full rounded-lg border border-line bg-paper/40 px-2.5 py-2.5 text-[11px] tabular-nums outline-none focus:border-clay/50 focus:bg-white"
                />
              </label>
            </div>
            <label className="block">
              <span className="mb-1.5 block text-[9px] font-medium tracking-[0.14em] text-faint">A NOTE FOR LATER</span>
              <textarea
                value={draft.note}
                onChange={(event) => set("note", event.target.value)}
                rows={4}
                className="w-full resize-none rounded-lg border border-line bg-paper/40 px-3 py-2.5 text-[12px] leading-relaxed outline-none transition placeholder:text-faint focus:border-clay/50 focus:bg-white"
                placeholder="The tiny details that make it yours."
              />
            </label>
          </div>

          <div className="mt-6 rounded-lg border border-line/60 bg-paper/35 p-3 text-[10px] leading-relaxed text-faint">
            Changes are saved to this device. Wander sees the updated plan the next time you ask.
          </div>
        </div>

        <div className="flex items-center gap-2 border-t border-line/70 px-5 py-4">
          <button
            onClick={() => onDelete(block.id)}
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-2.5 text-[11px] text-faint transition hover:bg-clay-soft/50 hover:text-clay"
          >
            <Trash2 size={13} /> Delete
          </button>
          <div className="flex-1" />
          <button onClick={onClose} className="rounded-lg px-3 py-2.5 text-[11px] text-muted transition hover:text-ink">Cancel</button>
          <button
            onClick={() => onSave(draft)}
            disabled={!draft.title.trim()}
            className="flex items-center gap-1.5 rounded-lg bg-ink px-3.5 py-2.5 text-[11px] font-medium text-paper transition hover:bg-moss disabled:opacity-40"
          >
            <Check size={13} /> Save block
          </button>
        </div>
      </aside>
    </div>
  );
}
