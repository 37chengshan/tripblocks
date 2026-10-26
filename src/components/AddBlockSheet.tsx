import { useState } from "react";
import { ArrowRight, Coffee, Landmark, Plus, Sparkles, TrainFront, TreePine, X } from "lucide-react";
import { kindMeta } from "../data";
import { useDialogFocus } from "../lib/useDialogFocus";
import type { Block, BlockKind, Day } from "../types";
import { KindIcon } from "./KindIcon";

const templates: Array<{ title: string; kind: BlockKind; duration: number; cost: number; place: string; icon: typeof Coffee }> = [
  { title: "Coffee & a pause", kind: "food", duration: 45, cost: 1200, place: "Somewhere nearby", icon: Coffee },
  { title: "A small museum", kind: "explore", duration: 90, cost: 1600, place: "Add a place", icon: Landmark },
  { title: "Train to somewhere", kind: "travel", duration: 45, cost: 1000, place: "From → to", icon: TrainFront },
  { title: "Free time", kind: "reset", duration: 120, cost: 0, place: "Keep it empty", icon: TreePine },
];

const inputClass =
  "w-full rounded-[10px] border border-black/10 bg-white px-3 py-2.5 text-[14px] leading-5 text-ink outline-none transition-colors duration-150 placeholder:text-[#8a8a8a] focus:border-clay/60";

export function AddBlockSheet({
  days,
  initialDay,
  onClose,
  onAdd,
}: {
  days: Day[];
  initialDay: number;
  onClose: () => void;
  onAdd: (block: Omit<Block, "id">) => void;
}) {
  const [dayId, setDayId] = useState(initialDay);
  const [title, setTitle] = useState("");
  const [place, setPlace] = useState("");
  const [kind, setKind] = useState<BlockKind>("explore");
  const [start, setStart] = useState("10:00");
  const [duration, setDuration] = useState(90);
  const [cost, setCost] = useState(0);
  const panelRef = useDialogFocus(onClose);

  const addTemplate = (template: (typeof templates)[number]) => {
    onAdd({
      dayId,
      kind: template.kind,
      title: template.title,
      place: template.place,
      start,
      duration: template.duration,
      cost: template.cost,
      note: "Added from a template.",
    });
  };

  const addCustom = () => {
    if (!title.trim()) return;
    onAdd({
      dayId,
      kind,
      title: title.trim(),
      place: place.trim() || "To be decided",
      start,
      duration,
      cost,
      note: "",
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <button aria-label="Close" className="absolute inset-0 bg-black/25" onClick={onClose} />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Add a block"
        className="animate-in relative max-h-[92vh] w-full overflow-y-auto rounded-t-xl border border-black/10 bg-white p-5 shadow-[0_16px_40px_rgba(0,0,0,0.16)] sm:max-w-[540px] sm:rounded-xl sm:p-6"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-1.5 text-[11px] font-medium tracking-[0.12em] text-clay-deep">
              <Sparkles size={12} /> ADD TO THE PLAN
            </div>
            <h2 className="mt-1 text-[20px] font-semibold leading-7 tracking-[-0.01em] text-ink">
              What sounds good?
            </h2>
          </div>
          <button
            onClick={onClose}
            className="grid h-7 w-7 shrink-0 place-items-center rounded-lg text-[#6d6b67] transition-colors duration-150 hover:bg-black/5 hover:text-ink"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        <div className="mt-3 flex items-center gap-2 text-[12px] text-[#525252]">
          <span>Adding to</span>
          <select
            value={dayId}
            onChange={(event) => setDayId(Number(event.target.value))}
            className="h-8 rounded-lg border border-black/10 bg-white px-2 text-[12px] text-ink outline-none transition-colors duration-150 focus:border-clay/60"
          >
            {days.map((day) => (
              <option key={day.id} value={day.id}>
                Day {day.id} · {day.label} {day.date}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          {templates.map((template) => {
            const Icon = template.icon;
            return (
              <button
                key={template.title}
                onClick={() => addTemplate(template)}
                className="group flex items-start gap-2.5 rounded-[10px] border border-black/10 bg-white p-3 text-left transition-colors duration-150 hover:border-black/20 hover:bg-[#fafafa]"
              >
                <div className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-black/[.04] text-[#525252]">
                  <Icon size={13} />
                </div>
                <div className="min-w-0">
                  <div className="text-[14px] font-medium leading-5 text-ink">{template.title}</div>
                  <div className="mt-0.5 text-[11px] text-[#6d6b67]">
                    {template.duration} min · {template.cost ? `¥${template.cost.toLocaleString()}` : "free"}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="my-5 flex items-center gap-3">
          <span className="h-px flex-1 bg-black/10" />
          <span className="text-[11px] tracking-[0.1em] text-[#6d6b67]">OR MAKE IT YOURS</span>
          <span className="h-px flex-1 bg-black/10" />
        </div>

        <div className="space-y-3">
          <div className="flex flex-wrap gap-1.5">
            {(Object.keys(kindMeta) as BlockKind[]).map((key) => (
              <button
                key={key}
                onClick={() => setKind(key)}
                className={`flex h-8 shrink-0 items-center gap-1.5 rounded-lg border px-2.5 text-[12px] transition-colors duration-150 ${
                  kind === key
                    ? "border-ink bg-ink text-white"
                    : "border-black/10 bg-white text-[#525252] hover:border-black/20 hover:text-ink"
                }`}
              >
                <KindIcon kind={key} size={12} /> {kindMeta[key].label}
              </button>
            ))}
          </div>
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="What are you doing?"
            className={inputClass}
          />
          <input
            value={place}
            onChange={(event) => setPlace(event.target.value)}
            placeholder="Where? (optional)"
            className={inputClass}
          />
          <div className="grid grid-cols-3 gap-2">
            <input
              type="time"
              value={start}
              onChange={(event) => setStart(event.target.value)}
              className={`${inputClass} px-2 tabular-nums`}
              aria-label="Start time"
            />
            <input
              type="number"
              min={15}
              step={15}
              value={duration}
              onChange={(event) => setDuration(Number(event.target.value))}
              className={`${inputClass} px-2 tabular-nums`}
              aria-label="Duration in minutes"
            />
            <input
              type="number"
              min={0}
              step={100}
              value={cost}
              onChange={(event) => setCost(Number(event.target.value))}
              className={`${inputClass} px-2 tabular-nums`}
              aria-label="Cost in yen"
            />
          </div>
        </div>

        <div className="mt-5 flex justify-end">
          <button
            onClick={addCustom}
            disabled={!title.trim()}
            className="flex h-9 items-center gap-1.5 rounded-lg bg-ink px-4 text-[12px] font-medium text-white transition-colors duration-150 hover:bg-[#2c2c2a] disabled:opacity-35"
          >
            <Plus size={13} /> Add block <ArrowRight size={12} />
          </button>
        </div>
      </div>
    </div>
  );
}
