import { useEffect, useMemo, useState } from "react";
import { ArrowUpRight, CalendarDays, ExternalLink, Globe2, MapPin, Plus, Search, X } from "lucide-react";
import { cityMeta } from "../data";
import { useDialogFocus } from "../lib/useDialogFocus";
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
  const panelRef = useDialogFocus(onClose, open);

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
    return items.filter((item) =>
      `${item.name} ${item.meta} ${item.address} ${item.description}`.toLowerCase().includes(term),
    );
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
      note: `${isHotel ? "FlyAI stay" : "FlyAI find"} · ${item.priceLabel}${
        item.price ? ` CNY (≈ ¥${(item.price * CNY_TO_JPY).toLocaleString()} JPY)` : ""
      } · live inventory`,
    });
    onClose();
  };

  const segmentClass = (active: boolean) =>
    `h-7 rounded-md px-2.5 text-[12px] transition-colors duration-150 ${
      active ? "bg-white text-ink shadow-[0_1px_2px_rgba(0,0,0,0.06)]" : "text-[#525252] hover:text-ink"
    }`;

  const fieldClass =
    "h-7 rounded-lg border border-black/10 bg-white px-2 text-[11px] text-ink outline-none transition-colors duration-150 focus:border-clay/60";

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <button aria-label="Close live options" className="absolute inset-0 bg-black/25" onClick={onClose} />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Live travel options"
        className="animate-in relative flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-xl border border-black/10 bg-white shadow-[0_16px_40px_rgba(0,0,0,0.16)] sm:max-w-[760px] sm:rounded-xl"
      >
        <div className="flex items-start justify-between gap-4 border-b border-black/10 px-5 pb-4 pt-4">
          <div>
            <div className="flex items-center gap-1.5 text-[11px] font-medium tracking-[0.12em] text-clay-deep">
              <Globe2 size={12} /> FLYAI · LIVE INVENTORY
            </div>
            <h2 className="mt-1 text-[20px] font-semibold leading-7 tracking-[-0.01em] text-ink">
              Real options, right here<span className="text-clay">.</span>
            </h2>
            <p className="mt-1 text-[13px] leading-5 text-[#525252]">
              Hotels and things to do, powered by Fliggy. Add one straight into the plan.
            </p>
          </div>
          <button
            onClick={onClose}
            className="grid h-7 w-7 shrink-0 place-items-center rounded-lg text-[#6d6b67] transition-colors duration-150 hover:bg-black/5 hover:text-ink"
            aria-label="Close"
          >
            <X size={17} />
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2 border-b border-black/[.06] px-5 py-2.5">
          <div className="flex rounded-lg border border-black/10 bg-[#f5f5f3] p-0.5">
            <button onClick={() => setKind("poi")} className={segmentClass(kind === "poi")}>
              Things to do
            </button>
            <button onClick={() => setKind("hotel")} className={segmentClass(kind === "hotel")}>
              Stays
            </button>
          </div>
          <select
            value={city}
            onChange={(event) => setCity(event.target.value as CityKey)}
            className={fieldClass}
          >
            {(Object.keys(cityMeta) as CityKey[])
              .filter((key) => key !== "kix")
              .map((key) => (
                <option key={key} value={key}>
                  {cityMeta[key].name}
                </option>
              ))}
          </select>
          {kind === "hotel" && (
            <>
              <label className={`flex items-center gap-1.5 ${fieldClass} text-[#525252]`}>
                <CalendarDays size={12} />
                <input
                  type="date"
                  value={from}
                  onChange={(event) => setFrom(event.target.value)}
                  className="w-[112px] bg-transparent text-[11px] tabular-nums outline-none"
                  aria-label="Check in"
                />
              </label>
              <span className="text-[11px] text-[#6d6b67]">→</span>
              <input
                type="date"
                value={to}
                onChange={(event) => setTo(event.target.value)}
                className={`${fieldClass} tabular-nums`}
                aria-label="Check out"
              />
            </>
          )}
          <div className="relative ml-auto min-w-[140px] flex-1 sm:flex-none">
            <Search size={12} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[#6d6b67]" />
            <input
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
              placeholder="Filter results"
              className="h-7 w-full rounded-lg border border-black/10 bg-white pl-7 pr-2 text-[12px] text-ink outline-none transition-colors duration-150 placeholder:text-[#6d6b67] focus:border-clay/60"
            />
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 text-[11px] text-[#6d6b67]">
              <span className={`h-1.5 w-1.5 rounded-full ${loading ? "bg-[#f59e0b]" : "bg-[#10b981]"}`} />
              {loading ? "Reading live inventory…" : `${visible.length} options from FlyAI`}
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-[#525252]">
              Add to
              <select
                value={dayId}
                onChange={(event) => setDayId(Number(event.target.value))}
                className={fieldClass}
              >
                {days.map((day) => (
                  <option key={day.id} value={day.id}>
                    Day {day.id} · {day.label} {day.date}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {loading && (
            <div className="grid gap-3 sm:grid-cols-2">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="overflow-hidden rounded-[10px] bg-[#fafafa]">
                  <div className="h-32 animate-pulse bg-black/[.06]" />
                  <div className="space-y-2 p-3">
                    <div className="h-3 w-2/3 animate-pulse rounded bg-black/[.06]" />
                    <div className="h-2 w-1/2 animate-pulse rounded bg-black/[.04]" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && error && (
            <div className="rounded-[10px] border border-black/10 bg-[#fafafa] p-5 text-center">
              <p className="text-[14px] font-medium text-ink">Live inventory is taking a breather.</p>
              <p className="mt-1 text-[12px] leading-5 text-[#525252]">
                The FlyAI bridge is offline. You can still shape the plan by hand.
              </p>
              <button
                onClick={() => setReload((value) => value + 1)}
                className="mt-3 h-7 rounded-lg border border-black/10 bg-white px-3 text-[11px] text-[#525252] transition-colors duration-150 hover:border-black/20 hover:text-ink"
              >
                Try again
              </button>
            </div>
          )}

          {!loading && !error && visible.length === 0 && (
            <div className="rounded-[10px] border border-dashed border-black/15 p-6 text-center text-[12px] text-[#6d6b67]">
              No matches. Try another city or filter.
            </div>
          )}

          {!loading && !error && (
            <div className="grid gap-3 sm:grid-cols-2">
              {visible.map((item) => (
                <article
                  key={item.id}
                  className="group overflow-hidden rounded-[10px] bg-[#fafafa] transition-colors duration-150 hover:bg-[#f4f4f2]"
                >
                  <div className="relative h-32 overflow-hidden bg-[#f0f0ee]">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt=""
                        loading="lazy"
                        referrerPolicy="no-referrer"
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-[11px] tracking-[0.1em] text-[#6d6b67]">
                        FLYAI · {cityMeta[city].name.toUpperCase()}
                      </div>
                    )}
                    <div className="absolute left-2 top-2 rounded-full bg-white/95 px-2 py-1 text-[11px] font-medium tracking-[0.04em] text-ink">
                      {item.kind === "hotel" ? "STAY" : "THINGS TO DO"}
                    </div>
                    {item.priceLabel && (
                      <div className="absolute bottom-2 right-2 rounded-full bg-ink/90 px-2 py-1 text-[11px] text-white">
                        {item.priceLabel}
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-[14px] font-medium leading-5 text-ink">{item.name}</h3>
                      <span className="shrink-0 text-[11px] text-[#6d6b67]">{item.meta.split(" · ")[0]}</span>
                    </div>
                    <p className="mt-1 line-clamp-2 text-[14px] leading-5 text-[#525252]">
                      {item.description || item.address}
                    </p>
                    <div className="mt-2 flex items-center justify-between border-t border-black/[.06] pt-2">
                      <div className="flex min-w-0 items-center gap-1 text-[11px] text-[#6d6b67]">
                        <MapPin size={11} className="shrink-0" />
                        <span className="truncate">
                          {item.address ? item.address.slice(0, 28) : cityMeta[city].name}
                        </span>
                      </div>
                      <div className="flex shrink-0 items-center gap-1.5">
                        {item.link && (
                          <a
                            href={item.link}
                            target="_blank"
                            rel="noreferrer"
                            className="grid h-7 w-7 place-items-center rounded-lg text-[#6d6b67] transition-colors duration-150 hover:bg-black/5 hover:text-ink"
                            aria-label={`Open ${item.name} on Fliggy`}
                          >
                            <ExternalLink size={12} />
                          </a>
                        )}
                        <button
                          onClick={() => add(item)}
                          className="flex h-7 items-center gap-1 rounded-lg border border-black/10 bg-white px-2 text-[11px] text-ink transition-colors duration-150 hover:border-black/20"
                        >
                          <Plus size={11} /> Add
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-black/10 px-5 py-2.5 text-[11px] text-[#6d6b67]">
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[#10b981]" /> Based on FlyAI real-time results · Fliggy
          </span>
          <span className="flex items-center gap-1">
            Prices shown in CNY. Adding a stay converts at ≈ ¥20 JPY / ¥1 CNY.
          </span>
          <a
            href="https://open.fly.ai/"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 text-clay-deep transition-colors duration-150 hover:text-ink"
          >
            open.fly.ai <ArrowUpRight size={11} />
          </a>
        </div>
      </div>
    </div>
  );
}
