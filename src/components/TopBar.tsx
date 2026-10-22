import { ArrowUpRight, Cloud, Download, Share2, Sparkles } from "lucide-react";

export function TopBar({
  onExport,
  onShare,
}: {
  onExport: () => void;
  onShare: () => void;
}) {
  return (
    <header className="sticky top-0 z-30 flex h-[62px] items-center justify-between border-b border-line/70 bg-paper/85 px-4 backdrop-blur-xl md:px-7">
      <div className="flex items-center gap-3">
        <div className="grid h-8 w-8 place-items-center rounded-full bg-ink text-paper">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M12 2.6 14.6 9.4 21.4 12l-6.8 2.6L12 21.4l-2.6-6.8L2.6 12l6.8-2.6L12 2.6Z" stroke="currentColor" strokeWidth="1.35" strokeLinejoin="round" />
            <circle cx="12" cy="12" r="2.1" fill="currentColor" />
          </svg>
        </div>
        <div className="leading-none">
          <div className="text-[11px] font-semibold tracking-[0.18em]">TRIPBLOCKS</div>
          <div className="mt-1 hidden text-[10px] tracking-[0.08em] text-faint sm:block">A calmer way to travel</div>
        </div>
        <span className="mx-1 hidden h-5 w-px bg-line md:block" />
        <div className="hidden items-center gap-2 text-[12px] text-muted md:flex">
          <span>Japan</span>
          <span className="text-line">/</span>
          <span className="text-ink">Kansai</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="mr-1 hidden items-center gap-1.5 rounded-full border border-line/70 bg-card/60 px-2.5 py-1.5 text-[10px] text-muted md:flex">
          <Cloud size={12} className="text-moss" />
          <span>Saved just now</span>
        </div>
        <div className="hidden items-center -space-x-1.5 sm:flex">
          <div className="grid h-7 w-7 place-items-center rounded-full border-2 border-paper bg-[#d9bda5] text-[10px] font-medium text-[#5b3f2c]">
            C
          </div>
          <div className="grid h-7 w-7 place-items-center rounded-full border-2 border-paper bg-[#b9c9c1] text-[10px] font-medium text-[#314b42]">
            L
          </div>
        </div>
        <button
          onClick={onShare}
          className="hidden items-center gap-1.5 rounded-full border border-line bg-card/60 px-3 py-1.5 text-[11px] text-muted transition hover:border-ink/25 hover:text-ink sm:flex"
        >
          <Share2 size={12} /> Share
        </button>
        <button
          onClick={onExport}
          className="flex items-center gap-1.5 rounded-full bg-ink px-3 py-1.5 text-[11px] font-medium text-paper transition hover:bg-moss"
        >
          <Download size={12} /> <span className="hidden sm:inline">Export plan</span>
          <span className="sm:hidden">Export</span>
        </button>
        <div className="hidden items-center gap-1 rounded-full border border-clay/20 bg-clay-soft/60 px-2.5 py-1.5 text-[10px] text-clay lg:flex">
          <Sparkles size={11} /> AI on
        </div>
      </div>
    </header>
  );
}

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
    <section className="relative overflow-hidden border-b border-line/60 px-4 pb-5 pt-6 md:px-7 md:pb-6 md:pt-7">
      <div className="pointer-events-none absolute -right-24 -top-28 h-72 w-72 rounded-full bg-[#e7d7c2]/40 blur-3xl" />
      <div className="relative flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
        <div className="max-w-2xl">
          <div className="mb-3 flex items-center gap-2 text-[10px] font-medium tracking-[0.2em] text-clay">
            <span className="h-px w-7 bg-clay/50" />
            NOV 06 — 12 · 2026
            <span className="h-1 w-1 rounded-full bg-clay/40" />
            <span className="text-muted">2 TRAVELERS</span>
          </div>
          <h1 className="font-display text-[42px] leading-[0.98] text-balance sm:text-[54px] lg:text-[60px]">
            {title}
            <span className="text-clay">.</span>
          </h1>
          <p className="mt-3 max-w-md text-[13px] leading-relaxed text-muted">{subtitle}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={onShare}
            className="flex items-center gap-2 rounded-xl border border-line bg-card/70 px-3.5 py-2.5 text-[12px] text-muted transition hover:border-ink/25 hover:text-ink"
          >
            <ArrowUpRight size={14} /> Invite a friend
          </button>
          <button
            onClick={onOptimize}
            className="group flex items-center gap-2 rounded-xl bg-clay px-3.5 py-2.5 text-[12px] font-medium text-white shadow-[0_8px_22px_-14px_rgba(189,96,64,.8)] transition hover:bg-[#a95034]"
          >
            <Sparkles size={14} className="transition group-hover:rotate-12" />
            Tune this trip
          </button>
        </div>
      </div>
      <div className="relative mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-line/50 pt-3.5 text-[11px] text-muted">
        <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-moss" /> 6 nights in a Gion machiya</span>
        <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-sun" /> Slow pace · 2–3 blocks a day</span>
        <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-sky" /> Rain window: Wed afternoon</span>
      </div>
    </section>
  );
}
