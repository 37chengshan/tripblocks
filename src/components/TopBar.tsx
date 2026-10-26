import { ArrowUpRight, Download, Share2, Sparkles } from "lucide-react";

/**
 * 48px workbench titlebar, CDS geometry: opaque surface-1, one hairline,
 * 13px brand/session title, 6px status dot, 28px ghost actions.
 */
export function TopBar({
  onExport,
  onShare,
  sessionTitle = "Japan / Kansai",
}: {
  onExport: () => void;
  onShare: () => void;
  sessionTitle?: string;
}) {
  return (
    <header className="sticky top-0 z-30 flex h-12 shrink-0 items-center justify-between gap-3 border-b border-black/10 bg-[#fcfcfb] px-3 md:px-4">
      <div className="flex min-w-0 items-center gap-2.5">
        <div className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-ink text-white">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M12 2.6 14.6 9.4 21.4 12l-6.8 2.6L12 21.4l-2.6-6.8L2.6 12l6.8-2.6L12 2.6Z"
              stroke="currentColor"
              strokeWidth="1.35"
              strokeLinejoin="round"
            />
            <circle cx="12" cy="12" r="2.1" fill="currentColor" />
          </svg>
        </div>
        <div className="flex min-w-0 items-center gap-2">
          <span className="shrink-0 text-[13px] font-medium tracking-[0.04em] text-ink">TRIPBLOCKS</span>
          <span className="hidden h-4 w-px shrink-0 bg-black/10 sm:block" />
          <span className="hidden min-w-0 truncate text-[13px] font-medium text-[#525252] sm:block">
            {sessionTitle}
          </span>
        </div>
        <span className="flex shrink-0 items-center gap-1.5 pl-1 text-[11px] text-[#6d6b67]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#10b981]" />
          <span className="hidden sm:inline">Saved</span>
        </span>
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <div className="mr-1 hidden items-center -space-x-1.5 sm:flex">
          <div className="grid h-7 w-7 place-items-center rounded-full bg-[#f0efec] text-[11px] font-medium text-[#525252] ring-2 ring-[#fcfcfb]">
            C
          </div>
          <div className="grid h-7 w-7 place-items-center rounded-full bg-[#e8e8e5] text-[11px] font-medium text-[#525252] ring-2 ring-[#fcfcfb]">
            L
          </div>
        </div>
        <button
          onClick={onShare}
          className="hidden h-7 items-center gap-1.5 rounded-lg px-2.5 text-[12px] text-[#525252] transition-colors duration-150 hover:bg-black/5 hover:text-ink sm:flex"
        >
          <Share2 size={13} /> Share
        </button>
        <button
          onClick={onExport}
          className="flex h-7 items-center gap-1.5 rounded-lg bg-ink px-2.5 text-[12px] font-medium text-white transition-colors duration-150 hover:bg-[#2c2c2a]"
        >
          <Download size={13} />
          <span className="hidden sm:inline">Export plan</span>
          <span className="sm:hidden">Export</span>
        </button>
        <span className="ml-1 hidden items-center gap-1.5 text-[11px] text-[#6d6b67] lg:flex">
          <span className="h-1.5 w-1.5 rounded-full bg-clay" />
          Agent on
        </span>
      </div>
    </header>
  );
}

/** Compact page header for the board view — no marketing display type. */
export function Hero({
  title,
  subtitle,
  onOptimize,
  onShare,
}: {
  title: string;
  subtitle: string;
  onOptimize: () => void;
  onShare: () => void;
}) {
  return (
    <section className="border-b border-black/10 bg-[#fcfcfb] px-4 py-4 md:px-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[11px] font-medium tracking-[0.12em] text-[#6d6b67]">
            NOV 06 — 12 · 2026 · 2 TRAVELERS
          </div>
          <h1 className="mt-1 text-[20px] font-semibold leading-6 tracking-[-0.01em] text-ink">{title}</h1>
          <p className="mt-0.5 max-w-xl text-[12px] leading-5 text-[#525252]">{subtitle}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onShare}
            className="flex h-8 items-center gap-1.5 rounded-lg border border-black/10 bg-white px-3 text-[12px] text-[#525252] transition-colors duration-150 hover:border-black/20 hover:text-ink"
          >
            <ArrowUpRight size={13} /> Invite
          </button>
          <button
            onClick={onOptimize}
            className="flex h-8 items-center gap-1.5 rounded-lg bg-clay-deep px-3 text-[12px] font-medium text-white transition-colors duration-150 hover:bg-[#a34a2a]"
          >
            <Sparkles size={13} /> Tune this trip
          </button>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1.5 border-t border-black/[.06] pt-2.5 text-[11px] text-[#6d6b67]">
        <span className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-[#10b981]" /> 6 nights in a Gion machiya
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-[#8a8a8a]" /> Slow pace · 2–3 blocks a day
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-clay" /> Rain window: Wed afternoon
        </span>
      </div>
    </section>
  );
}
