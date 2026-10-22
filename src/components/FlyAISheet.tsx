import { useEffect, useMemo, useState } from "react";
import { ArrowUpRight, CalendarDays, ExternalLink, Globe2, MapPin, Plus, Search, X } from "lucide-react";
import { cityMeta } from "../data";
import type { Block, CityKey, Day } from "../types";

type FlyItem = {
  id: string;
  kind: "poi" | "hotel";
  name: string;
  image: string;
  price: number;
  priceLabel: string;
  meta: string;
  address: string;
  description: string;
  link: string;
};

const flyCity: Record<CityKey, string> = {
  kyoto: "京都",
  osaka: "大阪",
  nara: "奈良",
  uji: "宇治",
  kix: "大阪",
};

const CNY_TO_JPY = 20;

export function FlyAISheet({
  open,
  initialCity,
  days,
  initialDay,
  checkIn,
  checkOut,
  onClose,
  onAdd,
}: {
  open: boolean;
  initialCity: CityKey;
  days: Day[];
  initialDay: number;
  checkIn: string;
  checkOut: string;
  onClose: () => void;
  onAdd: (block: Omit<Block, "id">) => void;
}) {
  const [kind, setKind] = useState<"poi" | "hotel">("poi");
  const [city, setCity] = useState<CityKey>(initialCity);
  const [from, setFrom] = useState(checkIn);
  const [to, setTo] = useState(checkOut);
  const [dayId, setDayId] = useState(initialDay);
  const [filter, setFilter] = useState("");
  const [items, setItems] = useState<FlyItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [reload, setReload] = useState(0);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    setCity(initialCity);
    setDayId(initialDay);
    setFilter("");
    setKind("poi");
  }, [open, initialCity, initialDay]);

  useEffect(() => {
    if (!open) return;
    const controller = new AbortController();
    setLoading(true);
    setError(false);
    const params = new URLSearchParams({ kind, city: flyCity[city] });
    if (kind === "hotel") {
      params.set("checkIn", from);
      params.set("checkOut", to);
    }
    fetch(`/api/flyai?${params.toString()}`, { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error("FlyAI unavailable");
        return (await response.json()) as { items: FlyItem[] };
      })
      .then((data) => setItems(data.items ?? []))
      .catch((err) => {
        if (err.name !== "AbortError") {
          setError(true);
          setItems([]);
        }
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [open, kind, city, from, to, reload]);

  const visible = useMemo(() => {
    const term = filter.trim().toLowerCase();
    if (!term) return items;
    return items.filter((item) => `${item.name} ${item.meta} ${item.address} ${item.description}`.toLowerCase().includes(term));
  }, [items, filter]);

  if (!open) return null;

  const add = (item: FlyItem) => {
    const isHotel = kind === "hotel";
    onAdd({
      dayId,
      kind: isHotel ? "stay" : "explore",
      title: item.name,
      place: item.address || cityMeta[city].name,
      start: isHotel ? "15:00" : "10:00",
      duration: isHotel ? 60 : 90,
      cost: item.price ? Math.round(item.price * CNY_TO_JPY) : 0,
      note: `${isHotel ? "FlyAI stay" : "FlyAI find"} · ${item.priceLabel}${item.price ? ` CNY (≈ ¥${(item.price * CNY_TO_JPY).toLocaleString()} JPY)` : ""} · live inventory`,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <button aria-label="Close live options" className="absolute inset-0 bg-ink/25 backdrop-blur-[2px]" onClick={onClose} />
      <div role="dialog" aria-modal="true" aria-label="Live travel options" className="animate-in relative flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-2xl border border-line bg-card shadow-2xl sm:max-w-[760px] sm:rounded-2xl">
        <div className="flex items-start justify-between border-b border-line/70 px-5 pb-4 pt-5">
          <div>
            <div className="flex items-center gap-1.5 text-[9px] font-medium tracking-[0.16em] text-clay">
              <Globe2 size={11} /> FLYAI · LIVE INVENTORY
            </div>
            <h2 className="mt-2 font-display text-[32px] leading-none">Real options, right here<span className="text-clay">.</span></h2>
            <p className="mt-2 text-[10.5px] text-muted">Hotels and things to do, powered by Fliggy. Add one straight into the plan.</p>
          </div>
          <button onClick={onClose} className="rounded-full p-1.5 text-faint transition hover:bg-paper hover:text-ink" aria-label="Close">
            <X size={17} />
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2 border-b border-line/60 px-5 py-3">
          <div className="flex rounded-full border border-line/80 bg-paper/40 p-0.5">
            <button onClick={() => setKind("poi")} className={`rounded-full px-3 py-1.5 text-[10px] transition ${kind === "poi" ? "bg-ink text-paper" : "text-muted hover:text-ink"}`}>Things to do</button>
            <button onClick={() => setKind("hotel")} className={`rounded-full px-3 py-1.5 text-[10px] transition ${kind === "hotel" ? "bg-ink text-paper" : "text-muted hover:text-ink"}`}>Stays</button>
          </div>
          <select value={city} onChange={(event) => setCity(event.target.value as CityKey)} className="rounded-full border border-line bg-paper/40 px-2.5 py-1.5 text-[10px] text-ink outline-none focus:border-clay/40">
            {(Object.keys(cityMeta) as CityKey[]).filter((key) => key !== "kix").map((key) => (
              <option key={key} value={key}>{cityMeta[key].name}</option>
            ))}
          </select>
          {kind === "hotel" && (
            <>
              <label className="flex items-center gap-1.5 rounded-full border border-line bg-paper/40 px-2.5 py-1.5 text-[9px] text-muted">
                <CalendarDays size={11} />
                <input type="date" value={from} onChange={(event) => setFrom(event.target.value)} className="w-[112px] bg-transparent text-[9px] tabular-nums outline-none" />
              </label>
              <span className="text-[9px] text-faint">→</span>
              <input type="date" value={to} onChange={(event) => setTo(event.target.value)} className="rounded-full border border-line bg-paper/40 px-2.5 py-1.5 text-[9px] tabular-nums text-muted outline-none" />
            </>
          )}
          <div className="relative ml-auto min-w-[140px] flex-1 sm:flex-none">
            <Search size={11} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-faint" />
            <input value={filter} onChange={(event) => setFilter(event.target.value)} placeholder="Filter results" className="w-full rounded-full border border-line bg-paper/40 py-1.5 pl-7 pr-2 text-[10px] outline-none placeholder:text-faint focus:border-clay/40" />
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[9px] text-faint">
              <span className={`h-1.5 w-1.5 rounded-full ${loading ? "bg-sun" : "bg-moss"}`} />
              {loading ? "Reading live inventory…" : `${visible.length} options from FlyAI`}
            </div>
            <div className="flex items-center gap-1.5 text-[9px] text-muted">
              Add to
              <select value={dayId} onChange={(event) => setDayId(Number(event.target.value))} className="rounded-full border border-line bg-paper/40 px-2 py-1 text-[9px] outline-none">
                {days.map((day) => <option key={day.id} value={day.id}>Day {day.id} · {day.label} {day.date}</option>)}
              </select>
            </div>
          </div>

          {loading && (
            <div className="grid gap-3 sm:grid-cols-2">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="overflow-hidden rounded-xl border border-line/70 bg-paper/30">
                  <div className="h-28 animate-pulse bg-line/35" />
                  <div className="space-y-2 p-3"><div className="h-3 w-2/3 animate-pulse rounded bg-line/45" /><div className="h-2 w-1/2 animate-pulse rounded bg-line/35" /></div>
                </div>
              ))}
            </div>
          )}

          {!loading && error && (
            <div className="rounded-xl border border-line bg-paper/35 p-5 text-center">
              <p className="text-[11px] font-medium text-ink">Live inventory is taking a breather.</p>
              <p className="mt-1 text-[10px] leading-relaxed text-muted">The FlyAI bridge is offline. You can still shape the plan by hand.</p>
              <button onClick={() => setReload((value) => value + 1)} className="mt-3 rounded-full border border-line px-3 py-1.5 text-[10px] text-muted transition hover:border-clay/30 hover:text-clay">Try again</button>
            </div>
          )}

          {!loading && !error && visible.length === 0 && (
            <div className="rounded-xl border border-dashed border-line p-6 text-center text-[10px] text-faint">No matches. Try another city or filter.</div>
          )}

          {!loading && !error && (
            <div className="grid gap-3 sm:grid-cols-2">
              {visible.map((item) => (
                <article key={item.id} className="group overflow-hidden rounded-xl border border-line/80 bg-paper/25 transition hover:border-clay/25">
                  <div className="relative h-[128px] overflow-hidden bg-paper-deep">
                    {item.image ? (
                      <img src={item.image} alt="" loading="lazy" referrerPolicy="no-referrer" className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-[10px] tracking-[0.12em] text-faint">FLYAI · {cityMeta[city].name.toUpperCase()}</div>
                    )}
                    <div className="absolute left-2 top-2 rounded-full bg-card/85 px-2 py-1 text-[8px] font-medium tracking-[0.06em] text-ink backdrop-blur">
                      {item.kind === "hotel" ? "STAY" : "THINGS TO DO"}
                    </div>
                    {item.priceLabel && (
                      <div className="absolute bottom-2 right-2 rounded-full bg-ink/85 px-2 py-1 text-[9px] text-paper backdrop-blur">{item.priceLabel}</div>
                    )}
                  </div>
                  <div className="p-3">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-[12px] font-medium leading-snug text-ink">{item.name}</h3>
                      <span className="shrink-0 text-[8.5px] text-faint">{item.meta.split(" · ")[0]}</span>
                    </div>
                    <p className="mt-1 line-clamp-2 text-[9.5px] leading-relaxed text-muted">{item.description || item.address}</p>
                    <div className="mt-2 flex items-center justify-between border-t border-line/50 pt-2">
                      <div className="flex items-center gap-1 text-[8.5px] text-faint">
                        <MapPin size={9} /> {item.address ? item.address.slice(0, 24) : cityMeta[city].name}
                      </div>
                      <div className="flex items-center gap-1.5">
                        {item.link && (
                          <a href={item.link} target="_blank" rel="noreferrer" className="rounded-full p-1 text-faint transition hover:bg-paper hover:text-clay" aria-label={`Open ${item.name} on Fliggy`}>
                            <ExternalLink size={11} />
                          </a>
                        )}
                        <button onClick={() => add(item)} className="flex items-center gap-1 rounded-full border border-line bg-card px-2 py-1 text-[9px] text-ink transition hover:border-clay/30 hover:bg-clay-soft/35">
                          <Plus size={10} /> Add
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line/70 px-5 py-3 text-[8.5px] text-faint">
          <span className="flex items-center gap-1.5"><span className="h-1 w-1 rounded-full bg-moss" /> Based on FlyAI real-time results · Fliggy</span>
          <span className="flex items-center gap-1">Prices shown in CNY. Adding a stay converts at ≈ ¥20 JPY / ¥1 CNY.</span>
          <a href="https://open.fly.ai/" target="_blank" rel="noreferrer" className="flex items-center gap-1 text-clay transition hover:underline">open.fly.ai <ArrowUpRight size={9} /></a>
        </div>
      </div>
    </div>
  );
}
