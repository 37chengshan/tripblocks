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

const MAP = {
  paper: "#f7f7f5",
  sea: "#eef0ef",
  coast: "#cfd3d1",
  land: "#ffffff",
  line: "rgba(0,0,0,0.10)",
  faint: "rgba(0,0,0,0.08)",
  label: "#6d6b67",
  ink: "#525252",
  clay: "#d97757",
};

export function RouteMap({ trip, onAsk }: { trip: Trip; onAsk: (prompt: string) => void }) {
  const [selected, setSelected] = useState<CityKey | "all">("all");
  const filteredDays = selected === "all" ? trip.days : trip.days.filter((day) => day.city === selected);

  return (
    <div className="animate-in bg-[#fcfcfb] px-4 py-4 md:px-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="text-[11px] font-medium tracking-[0.12em] text-[#6d6b67]">THE ROUTE</div>
          <h2 className="mt-0.5 text-[20px] font-semibold leading-6 tracking-[-0.01em] text-ink">
            A shape with room to breathe
          </h2>
          <p className="mt-1 max-w-md text-[12px] leading-5 text-[#525252]">
            Four bases, one loop. Nothing is more than 50 minutes from the next good idea.
          </p>
        </div>
        <button
          onClick={() =>
            onAsk(
              "Is this route order the calmest option? Could we reduce the number of moves without missing Nara or Uji?",
            )
          }
          className="flex h-7 items-center gap-1.5 rounded-lg border border-black/10 bg-white px-2.5 text-[11px] text-[#525252] transition-colors duration-150 hover:border-black/20 hover:text-ink"
        >
          <Compass size={12} /> Ask about the route
        </button>
      </div>

      <div className="mt-4 grid overflow-hidden rounded-xl border border-black/10 bg-white lg:h-[520px] lg:grid-cols-[1.45fr_1fr]">
        <div className="relative min-h-[360px] overflow-hidden border-b border-black/[.06] lg:min-h-0 lg:border-b-0 lg:border-r">
          <div className="absolute left-4 top-4 z-10 flex items-center gap-2 rounded-full border border-black/10 bg-white/95 px-2.5 py-1 text-[11px] text-[#525252]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#10b981]" /> Kansai · not to scale
          </div>
          <div className="absolute bottom-4 left-4 z-10 flex items-center gap-2 text-[11px] tracking-[0.08em] text-[#6d6b67]">
            <Wind size={11} /> 50 MIN MAX BETWEEN BASES
          </div>
          <svg
            viewBox="0 0 620 420"
            className="h-full min-h-[360px] w-full lg:min-h-[470px]"
            role="img"
            aria-label="Stylized route map of Kansai"
          >
            <defs>
              <filter id="soft-land">
                <feDropShadow dx="0" dy="4" stdDeviation="8" floodColor="#000000" floodOpacity=".08" />
              </filter>
              <pattern id="map-dots" width="18" height="18" patternUnits="userSpaceOnUse">
                <circle cx="1.2" cy="1.2" r=".8" fill="#000000" opacity=".06" />
              </pattern>
            </defs>
            <rect width="620" height="420" fill={MAP.paper} />
            <rect width="620" height="420" fill="url(#map-dots)" />

            {/* sea */}
            <path
              d="M354 0h266v420H448c-24-43-16-77-41-109-20-26-55-36-70-71-18-41 15-79 4-117-8-28-27-63 13-123Z"
              fill={MAP.sea}
              opacity=".9"
            />
            <path
              d="M0 308c62-19 112-6 151 19 44 28 63 49 114 34 31-9 45-26 57-48 9-17 6-44 23-46 18-3 30 23 44 35"
              fill="none"
              stroke={MAP.coast}
              strokeWidth="1"
              opacity=".8"
            />
            <path
              d="M0 332c69-18 114-2 161 24 36 20 63 24 99 13"
              fill="none"
              stroke={MAP.coast}
              strokeWidth=".8"
              opacity=".6"
            />

            {/* land masses */}
            <path
              d="M74 66c31-27 77-23 111-10 31 12 47 2 77 12 31 11 42 43 26 72-18 33-57 29-72 59-15 29 2 66-24 81-25 15-57-3-77-27-19-23-23-52-44-72-22-21-44-42-30-72 6-13 18-28 33-43Z"
              fill={MAP.land}
              stroke={MAP.line}
              strokeWidth="1"
              filter="url(#soft-land)"
            />
            <path
              d="M308 156c24-18 57-17 82-3 26 14 31 45 55 56 20 9 54 1 66 22 10 19-9 40-30 48-24 9-47-4-68 7-23 12-32 39-57 38-28-1-46-31-42-58 3-24 14-42 3-64-6-12-16-28-9-46Z"
              fill={MAP.land}
              stroke={MAP.line}
              strokeWidth="1"
              filter="url(#soft-land)"
            />
            <path
              d="M96 264c20-18 55-10 70 9 14 19 5 50-17 62-22 12-53 4-64-17-9-16-4-40 11-54Z"
              fill={MAP.land}
              stroke={MAP.line}
              strokeWidth=".9"
            />

            {/* contours */}
            {[0, 1, 2, 3].map((i) => (
              <path
                key={i}
                d={`M${132 + i * 13} ${102 + i * 13}c35-20 81-12 101 13 18 24 5 53-21 68-25 14-57 7-68-15-9-19 1-39-12-66Z`}
                fill="none"
                stroke={MAP.faint}
                strokeWidth=".7"
                opacity=".9"
              />
            ))}
            <path
              d="M430 248c20-13 46-6 53 12 6 15-5 31-23 34-21 4-39-8-38-22 0-9 3-17 8-24Z"
              fill="none"
              stroke={MAP.faint}
              strokeWidth=".8"
            />
            <path
              d="M462 306c14-10 34-2 37 11 3 12-7 25-22 26-16 1-28-10-25-21 2-6 5-11 10-16Z"
              fill="none"
              stroke={MAP.faint}
              strokeWidth=".7"
            />

            {/* labels */}
            <text x="83" y="305" fill={MAP.label} fontSize="11" letterSpacing=".1em" opacity=".85">
              INLAND SEA
            </text>
            <text x="478" y="330" fill={MAP.label} fontSize="11" letterSpacing=".1em" opacity=".85">
              OSAKA BAY
            </text>
            <text x="146" y="56" fill={MAP.label} fontSize="11" letterSpacing=".14em" opacity=".8">
              KYOTO PREF.
            </text>
            <text x="408" y="118" fill={MAP.label} fontSize="11" letterSpacing=".14em" opacity=".8">
              SHIGA
            </text>

            {/* route */}
            <path
              d="M245 152 C286 176 319 196 344 222 M344 222 C360 238 350 245 356 260 M356 260 C390 249 438 225 468 190 M468 190 C430 200 371 212 344 222 M344 222 C335 270 348 318 376 360"
              fill="none"
              stroke={MAP.clay}
              strokeWidth="1.6"
              strokeDasharray="4 5"
              strokeLinecap="round"
              opacity=".8"
            />

            {route.map((key, index) => {
              const point = points[key];
              const city = cityMeta[key as CityKey];
              const active = selected === key;
              const count = trip.days.filter((day) => day.city === key).length;
              const label: { x: number; y: number; anchor: "start" | "middle" } =
                key === "uji" ? { x: 22, y: -4, anchor: "start" } : { x: 0, y: active ? 32 : 30, anchor: "middle" };
              const indexLine: { x: number; y: number; anchor: "start" | "middle" } =
                key === "uji"
                  ? { x: 22, y: 10, anchor: "start" }
                  : { x: 0, y: active ? 44 : 42, anchor: "middle" };
              if (key === "kix") {
                return (
                  <g key={key} transform={`translate(${point.x} ${point.y})`}>
                    <circle r="8" fill={MAP.land} stroke="rgba(0,0,0,0.25)" strokeWidth="1" />
                    <path d="M-3 2 3-3M-2-2 3 3" stroke="rgba(0,0,0,0.35)" strokeWidth="1" />
                    <text x="15" y="4" fontSize="11" fill={MAP.ink}>
                      KIX · fly home
                    </text>
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
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      setSelected(active ? "all" : (key as CityKey));
                    }
                  }}
                >
                  <circle
                    r={active ? 19 : 16}
                    fill={active ? MAP.clay : MAP.land}
                    stroke={active ? MAP.clay : "rgba(0,0,0,0.25)"}
                    strokeWidth="1.1"
                  />
                  <text
                    textAnchor="middle"
                    y="4"
                    fontSize="11"
                    fontWeight="600"
                    fill={active ? "#ffffff" : MAP.ink}
                  >
                    {count}
                  </text>
                  <text
                    textAnchor={label.anchor}
                    x={label.x}
                    y={label.y}
                    fontSize="11"
                    fontWeight="600"
                    fill={MAP.ink}
                  >
                    {city.name}
                  </text>
                  <text
                    textAnchor={indexLine.anchor}
                    x={indexLine.x}
                    y={indexLine.y}
                    fontSize="11"
                    letterSpacing=".08em"
                    fill={MAP.label}
                  >
                    {String(index + 1).padStart(2, "0")}
                  </text>
                </g>
              );
            })}

            {/* compass */}
            <g transform="translate(550 62)" opacity=".7">
              <circle r="17" fill="none" stroke="rgba(0,0,0,0.18)" strokeWidth=".7" />
              <path d="M0-13 2.5-2.5 13 0 2.5 2.5 0 13-2.5 2.5-13 0-2.5-2.5Z" fill={MAP.label} opacity=".55" />
              <text textAnchor="middle" y="-21" fontSize="11" fill={MAP.label}>
                N
              </text>
            </g>
          </svg>
        </div>

        <div className="flex min-h-0 min-w-0 flex-col bg-white">
          <div className="flex items-center justify-between border-b border-black/[.06] px-4 py-2.5">
            <div className="text-[11px] font-medium tracking-[0.1em] text-[#6d6b67]">
              {selected === "all" ? "THE WHOLE LOOP" : cityMeta[selected].name.toUpperCase()}
            </div>
            {selected !== "all" && (
              <button
                onClick={() => setSelected("all")}
                className="text-[11px] text-clay-deep transition-colors duration-150 hover:text-ink"
              >
                show all
              </button>
            )}
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
            <div className="space-y-4">
              {filteredDays.map((day) => {
                const blocks = trip.blocks
                  .filter((block) => block.dayId === day.id)
                  .sort((a, b) => a.start.localeCompare(b.start));
                const cost = blocks.reduce((sum, block) => sum + block.cost, 0);
                return (
                  <div key={day.id} className="flex gap-3">
                    <div className="w-9 shrink-0 pt-0.5 text-right">
                      <div className="text-[20px] font-semibold leading-none tracking-[-0.02em] text-ink">
                        {day.date}
                      </div>
                      <div className="mt-1 text-[11px] tracking-[0.08em] text-[#6d6b67]">{day.label}</div>
                    </div>
                    <div className="min-w-0 flex-1 border-l border-black/10 pl-3">
                      <button
                        onClick={() => setSelected(day.city)}
                        className="flex items-center gap-1.5 text-[11px] text-[#525252] transition-colors duration-150 hover:text-clay-deep"
                      >
                        <MapPin size={11} /> {cityMeta[day.city].name} <ArrowRight size={10} className="text-[#6d6b67]" />
                      </button>
                      <div className="mt-1 space-y-1">
                        {blocks.map((block) => (
                          <div key={block.id} className="flex items-baseline justify-between gap-2 text-[12px]">
                            <span className="truncate text-ink">{block.title}</span>
                            <span className="shrink-0 tabular-nums text-[11px] text-[#6d6b67]">
                              {block.cost ? formatYen(block.cost) : "—"}
                            </span>
                          </div>
                        ))}
                      </div>
                      <div className="mt-1.5 text-[11px] text-[#6d6b67]">
                        {blocks.length} blocks · {cost ? formatYen(cost) : "no spend"}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="border-t border-black/[.06] px-4 py-2.5">
            <button
              onClick={() =>
                onAsk(
                  "We are based in Kyoto for six nights with day trips. Is that the right base, or should we spend one night in Osaka?",
                )
              }
              className="flex w-full items-center justify-between text-[12px] text-clay-deep transition-colors duration-150 hover:text-ink"
            >
              <span className="flex items-center gap-1.5">
                <Compass size={12} /> Is this base right?
              </span>
              <ArrowRight size={12} />
            </button>
          </div>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-[11px] text-[#6d6b67]">
        {Object.entries(cityMeta)
          .filter(([key]) => key !== "kix")
          .map(([key, meta]) => (
            <button
              key={key}
              onClick={() => setSelected(key as CityKey)}
              className="flex items-center gap-1.5 transition-colors duration-150 hover:text-clay-deep"
            >
              <span className="h-2 w-2 rounded-full border border-black/20 bg-[#f0f0ee]" /> {meta.name} · {meta.jp}
            </button>
          ))}
        <span className="flex items-center gap-1.5">
          <span className="h-px w-4 border-t border-dashed border-clay" /> rail / road
        </span>
      </div>
    </div>
  );
}
