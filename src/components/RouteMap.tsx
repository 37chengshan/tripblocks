import { useState } from "react";
import { ArrowRight, Compass, MapPin, Wind } from "lucide-react";
import { cityMeta, formatYen } from "../data";
import type { CityKey, Trip } from "../types";

const points: Record<string, { x: number; y: number }> = {
  kyoto: { x: 245, y: 152 },
  nara: { x: 356, y: 260 },
  osaka: { x: 468, y: 190 },
  uji: { x: 344, y: 222 },
  kix: { x: 376, y: 360 },
};

const route = ["kyoto", "nara", "osaka", "uji", "kix"] as const;

export function RouteMap({ trip, onAsk }: { trip: Trip; onAsk: (prompt: string) => void }) {
  const [selected, setSelected] = useState<CityKey | "all">("all");
  const filteredDays = selected === "all" ? trip.days : trip.days.filter((day) => day.city === selected);

  return (
    <div className="animate-in px-4 py-5 md:px-7">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="text-[10px] font-medium tracking-[0.16em] text-faint">THE ROUTE</div>
          <h2 className="mt-1 font-display text-[32px] leading-none">A shape with room to breathe<span className="text-clay">.</span></h2>
          <p className="mt-2 max-w-md text-[11.5px] leading-relaxed text-muted">Four bases, one loop. Nothing is more than 50 minutes from the next good idea.</p>
        </div>
        <button
          onClick={() => onAsk("Is this route order the calmest option? Could we reduce the number of moves without missing Nara or Uji?")}
          className="flex items-center gap-1.5 rounded-full border border-line bg-card/55 px-3 py-1.5 text-[10.5px] text-muted transition hover:border-clay/30 hover:text-clay"
        >
          <Compass size={12} /> Ask about the route
        </button>
      </div>

      <div className="mt-5 grid overflow-hidden rounded-2xl border border-line/80 bg-[#ece7db] lg:grid-cols-[1.45fr_1fr]">
        <div className="relative min-h-[360px] overflow-hidden border-b border-line/70 lg:min-h-[470px] lg:border-b-0 lg:border-r">
          <div className="absolute left-4 top-4 z-10 flex items-center gap-2 rounded-full border border-white/50 bg-[#f7f2e7]/70 px-2.5 py-1.5 text-[9px] text-muted backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-moss" /> Kansai · not to scale
          </div>
          <div className="absolute bottom-4 left-4 z-10 flex items-center gap-2 text-[8px] tracking-[0.1em] text-[#7a7365]">
            <Wind size={10} /> 50 MIN MAX BETWEEN BASES
          </div>
          <svg viewBox="0 0 620 420" className="h-full min-h-[360px] w-full lg:min-h-[470px]" role="img" aria-label="Stylized route map of Kansai">
            <defs>
              <filter id="soft-land">
                <feDropShadow dx="0" dy="4" stdDeviation="8" floodColor="#8c826e" floodOpacity=".12" />
              </filter>
              <pattern id="map-dots" width="18" height="18" patternUnits="userSpaceOnUse">
                <circle cx="1.2" cy="1.2" r=".8" fill="#8b8373" opacity=".18" />
              </pattern>
            </defs>
            <rect width="620" height="420" fill="#ece7db" />
            <rect width="620" height="420" fill="url(#map-dots)" />

            {/* sea */}
            <path d="M354 0h266v420H448c-24-43-16-77-41-109-20-26-55-36-70-71-18-41 15-79 4-117-8-28-27-63 13-123Z" fill="#d9e2df" opacity=".72" />
            <path d="M0 308c62-19 112-6 151 19 44 28 63 49 114 34 31-9 45-26 57-48 9-17 6-44 23-46 18-3 30 23 44 35" fill="none" stroke="#b5c7c4" strokeWidth="1" opacity=".8" />
            <path d="M0 332c69-18 114-2 161 24 36 20 63 24 99 13" fill="none" stroke="#b5c7c4" strokeWidth=".8" opacity=".6" />

            {/* land masses */}
            <path d="M74 66c31-27 77-23 111-10 31 12 47 2 77 12 31 11 42 43 26 72-18 33-57 29-72 59-15 29 2 66-24 81-25 15-57-3-77-27-19-23-23-52-44-72-22-21-44-42-30-72 6-13 18-28 33-43Z" fill="#f7f2e5" stroke="#d4c9b4" strokeWidth="1" filter="url(#soft-land)" />
            <path d="M308 156c24-18 57-17 82-3 26 14 31 45 55 56 20 9 54 1 66 22 10 19-9 40-30 48-24 9-47-4-68 7-23 12-32 39-57 38-28-1-46-31-42-58 3-24 14-42 3-64-6-12-16-28-9-46Z" fill="#f3ecdd" stroke="#d4c9b4" strokeWidth="1" filter="url(#soft-land)" />
            <path d="M96 264c20-18 55-10 70 9 14 19 5 50-17 62-22 12-53 4-64-17-9-16-4-40 11-54Z" fill="#f6f0e3" stroke="#d4c9b4" strokeWidth=".9" />

            {/* contours */}
            {[0, 1, 2, 3].map((i) => (
              <path
                key={i}
                d={`M${132 + i * 13} ${102 + i * 13}c35-20 81-12 101 13 18 24 5 53-21 68-25 14-57 7-68-15-9-19 1-39-12-66Z`}
                fill="none"
                stroke="#d8cdb9"
                strokeWidth=".7"
                opacity=".75"
              />
            ))}
            <path d="M430 248c20-13 46-6 53 12 6 15-5 31-23 34-21 4-39-8-38-22 0-9 3-17 8-24Z" fill="none" stroke="#d8cdb9" strokeWidth=".8" />
            <path d="M462 306c14-10 34-2 37 11 3 12-7 25-22 26-16 1-28-10-25-21 2-6 5-11 10-16Z" fill="none" stroke="#d8cdb9" strokeWidth=".7" />

            {/* labels */}
            <text x="83" y="305" fill="#8f8675" fontSize="8" letterSpacing=".12em" opacity=".7">INLAND SEA</text>
            <text x="490" y="330" fill="#8f8675" fontSize="8" letterSpacing=".12em" opacity=".7">OSAKA BAY</text>
            <text x="150" y="56" fill="#8f8675" fontSize="8" letterSpacing=".16em" opacity=".65">KYOTO PREF.</text>
            <text x="408" y="118" fill="#8f8675" fontSize="8" letterSpacing=".16em" opacity=".65">SHIGA</text>

            {/* route */}
            <path
              d="M245 152 C286 176 319 196 344 222 M344 222 C360 238 350 245 356 260 M356 260 C390 249 438 225 468 190 M468 190 C430 200 371 212 344 222 M344 222 C335 270 348 318 376 360"
              fill="none"
              stroke="#b9694d"
              strokeWidth="1.6"
              strokeDasharray="4 5"
              strokeLinecap="round"
              opacity=".75"
            />

            {route.map((key, index) => {
              const point = points[key];
              const city = cityMeta[key as CityKey];
              const active = selected === key;
              const count = trip.days.filter((day) => day.city === key).length;
              if (key === "kix") {
                return (
                  <g key={key} transform={`translate(${point.x} ${point.y})`}>
                    <circle r="8" fill="#f7f2e7" stroke="#9b917f" strokeWidth="1" />
                    <path d="M-3 2 3-3M-2-2 3 3" stroke="#9b917f" strokeWidth="1" />
                    <text x="15" y="3" fontSize="9" fill="#7b7364">KIX · fly home</text>
                  </g>
                );
              }
              return (
                <g
                  key={key}
                  transform={`translate(${point.x} ${point.y})`}
                  className="cursor-pointer"
                  onClick={() => setSelected(active ? "all" : (key as CityKey))}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") setSelected(active ? "all" : (key as CityKey));
                  }}
                >
                  <circle r={active ? 19 : 16} fill={active ? "#bd6040" : "#f7f2e7"} stroke={active ? "#bd6040" : city.ink} strokeWidth="1.1" opacity={active ? 1 : 0.95} />
                  <text textAnchor="middle" y="3.5" fontSize="9" fontWeight="600" fill={active ? "#fff" : city.ink}>{count}</text>
                  <text textAnchor="middle" y={active ? 31 : 28} fontSize="10" fontWeight="600" fill="#4b4d44">{city.name}</text>
                  <text textAnchor="middle" y={active ? 41 : 38} fontSize="6.5" letterSpacing=".1em" fill="#918776">{String(index + 1).padStart(2, "0")}</text>
                </g>
              );
            })}

            {/* compass */}
            <g transform="translate(550 62)" opacity=".65">
              <circle r="17" fill="none" stroke="#a99e8b" strokeWidth=".7" />
              <path d="M0-13 2.5-2.5 13 0 2.5 2.5 0 13-2.5 2.5-13 0-2.5-2.5Z" fill="#a99e8b" opacity=".55" />
              <text textAnchor="middle" y="-21" fontSize="7" fill="#8e8473">N</text>
            </g>
          </svg>
        </div>

        <div className="flex flex-col bg-card/45">
          <div className="flex items-center justify-between border-b border-line/60 px-4 py-3">
            <div className="text-[9px] font-medium tracking-[0.14em] text-faint">{selected === "all" ? "THE WHOLE LOOP" : cityMeta[selected].name.toUpperCase()}</div>
            {selected !== "all" && (
              <button onClick={() => setSelected("all")} className="text-[9px] text-clay transition hover:underline">show all</button>
            )}
          </div>
          <div className="flex-1 overflow-y-auto px-4 py-3">
            <div className="space-y-4">
              {filteredDays.map((day) => {
                const blocks = trip.blocks.filter((block) => block.dayId === day.id).sort((a, b) => a.start.localeCompare(b.start));
                const cost = blocks.reduce((sum, block) => sum + block.cost, 0);
                return (
                  <div key={day.id} className="flex gap-3">
                    <div className="w-8 shrink-0 pt-0.5 text-right">
                      <div className="font-display text-[20px] leading-none">{day.date}</div>
                      <div className="mt-0.5 text-[7px] tracking-[0.12em] text-faint">{day.label}</div>
                    </div>
                    <div className="min-w-0 flex-1 border-l border-line/70 pl-3">
                      <button onClick={() => setSelected(day.city)} className="flex items-center gap-1.5 text-[10px] text-muted transition hover:text-clay">
                        <MapPin size={10} /> {cityMeta[day.city].name} <ArrowRight size={9} className="text-faint" />
                      </button>
                      <div className="mt-1 space-y-1">
                        {blocks.map((block) => (
                          <div key={block.id} className="flex items-baseline justify-between gap-2 text-[10px]">
                            <span className="truncate text-ink/85">{block.title}</span>
                            <span className="shrink-0 tabular-nums text-[9px] text-faint">{block.cost ? formatYen(block.cost) : "—"}</span>
                          </div>
                        ))}
                      </div>
                      <div className="mt-1.5 text-[8.5px] text-faint">{blocks.length} blocks · {cost ? formatYen(cost) : "no spend"}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="border-t border-line/60 px-4 py-3">
            <button
              onClick={() => onAsk("We are based in Kyoto for six nights with day trips. Is that the right base, or should we spend one night in Osaka?")}
              className="flex w-full items-center justify-between text-[10px] text-clay transition hover:text-clay/75"
            >
              <span className="flex items-center gap-1.5"><Compass size={11} /> Is this base right?</span>
              <ArrowRight size={12} />
            </button>
          </div>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-[9px] text-faint">
        {Object.entries(cityMeta).filter(([key]) => key !== "kix").map(([key, meta]) => (
          <button key={key} onClick={() => setSelected(key as CityKey)} className="flex items-center gap-1.5 transition hover:text-clay">
            <span className="h-2 w-2 rounded-full border" style={{ background: meta.tint, borderColor: meta.ink }} /> {meta.name} · {meta.jp}
          </button>
        ))}
        <span className="flex items-center gap-1.5"><span className="h-px w-4 border-t border-dashed border-clay" /> rail / road</span>
      </div>
    </div>
  );
}
