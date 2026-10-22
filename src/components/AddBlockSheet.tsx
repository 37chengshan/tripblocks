import { useState } from "react";
import { ArrowRight, Coffee, Landmark, Plus, Sparkles, TrainFront, TreePine, X } from "lucide-react";
import { kindMeta } from "../data";
import type { Block, BlockKind, Day } from "../types";
import { KindIcon } from "./KindIcon";

const templates: Array<{ title: string; kind: BlockKind; duration: number; cost: number; place: string; icon: typeof Coffee }> = [
  { title: "Coffee & a pause", kind: "food", duration: 45, cost: 1200, place: "Somewhere nearby", icon: Coffee },
  { title: "A small museum", kind: "explore", duration: 90, cost: 1600, place: "Add a place", icon: Landmark },
  { title: "Train to somewhere", kind: "travel", duration: 45, cost: 1000, place: "From → to", icon: TrainFront },
  { title: "Free time", kind: "reset", duration: 120, cost: 0, place: "Keep it empty", icon: TreePine },
];

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
      <button aria-label="Close" className="absolute inset-0 bg-ink/25 backdrop-blur-[2px]" onClick={onClose} />
      <div className="animate-in relative max-h-[92vh] w-full overflow-y-auto rounded-t-2xl border border-line bg-card p-5 shadow-2xl sm:max-w-[540px] sm:rounded-2xl sm:p-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-[9px] font-medium tracking-[0.16em] text-clay"><Sparkles size={11} /> ADD TO THE PLAN</div>
            <h2 className="mt-2 font-display text-[30px] leading-none">What sounds good?</h2>
          </div>
          <button onClick={onClose} className="rounded-full p-1.5 text-faint transition hover:bg-paper hover:text-ink" aria-label="Close">
            <X size={16} />
          </button>
        </div>

        <div className="mt-4 flex items-center gap-2 text-[11px] text-muted">
          <span>Adding to</span>
          <select
            value={dayId}
            onChange={(event) => setDayId(Number(event.target.value))}
            className="rounded-lg border border-line bg-paper/45 px-2.5 py-1.5 text-[11px] text-ink outline-none focus:border-clay/50"
          >
            {days.map((day) => (
              <option key={day.id} value={day.id}>Day {day.id} · {day.label} {day.date}</option>
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
                className="group flex items-start gap-2.5 rounded-xl border border-line/80 bg-paper/30 p-3 text-left transition hover:-translate-y-0.5 hover:border-clay/30 hover:bg-paper/65"
              >
                <div className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full" style={{ background: kindMeta[template.kind].soft, color: kindMeta[template.kind].tone }}>
                  <Icon size={13} />
                </div>
                <div className="min-w-0">
                  <div className="text-[11px] font-medium text-ink">{template.title}</div>
                  <div className="mt-0.5 text-[9px] text-faint">{template.duration} min · {template.cost ? `¥${template.cost.toLocaleString()}` : "free"}</div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="my-5 flex items-center gap-3">
          <span className="h-px flex-1 bg-line/70" />
          <span className="text-[9px] tracking-[0.12em] text-faint">OR MAKE IT YOURS</span>
          <span className="h-px flex-1 bg-line/70" />
        </div>

        <div className="space-y-3">
          <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {(Object.keys(kindMeta) as BlockKind[]).map((key) => (
              <button
                key={key}
                onClick={() => setKind(key)}
                className={`flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-[10px] transition ${
                  kind === key ? "border-ink/20 bg-ink text-paper" : "border-line text-muted hover:border-ink/20"
                }`}
              >
                <KindIcon kind={key} size={11} /> {kindMeta[key].label}
              </button>
            ))}
          </div>
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="What are you doing?"
            className="w-full rounded-lg border border-line bg-paper/35 px-3 py-2.5 text-[12px] outline-none placeholder:text-faint focus:border-clay/50 focus:bg-white"
          />
          <input
            value={place}
            onChange={(event) => setPlace(event.target.value)}
            placeholder="Where? (optional)"
            className="w-full rounded-lg border border-line bg-paper/35 px-3 py-2.5 text-[12px] outline-none placeholder:text-faint focus:border-clay/50 focus:bg-white"
          />
          <div className="grid grid-cols-3 gap-2">
            <input
              type="time"
              value={start}
              onChange={(event) => setStart(event.target.value)}
              className="rounded-lg border border-line bg-paper/35 px-2.5 py-2.5 text-[11px] tabular-nums outline-none focus:border-clay/50 focus:bg-white"
            />
            <input
              type="number"
              min={15}
              step={15}
              value={duration}
              onChange={(event) => setDuration(Number(event.target.value))}
              className="rounded-lg border border-line bg-paper/35 px-2.5 py-2.5 text-[11px] tabular-nums outline-none focus:border-clay/50 focus:bg-white"
              aria-label="Duration in minutes"
            />
            <input
              type="number"
              min={0}
              step={100}
              value={cost}
              onChange={(event) => setCost(Number(event.target.value))}
              className="rounded-lg border border-line bg-paper/35 px-2.5 py-2.5 text-[11px] tabular-nums outline-none focus:border-clay/50 focus:bg-white"
              aria-label="Cost in yen"
            />
          </div>
        </div>

        <div className="mt-5 flex justify-end">
          <button
            onClick={addCustom}
            disabled={!title.trim()}
            className="flex items-center gap-1.5 rounded-lg bg-ink px-4 py-2.5 text-[11px] font-medium text-paper transition hover:bg-moss disabled:opacity-35"
          >
            <Plus size={13} /> Add block <ArrowRight size={12} />
          </button>
        </div>
      </div>
    </div>
  );
}
