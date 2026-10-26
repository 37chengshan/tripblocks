import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Check,
  ChevronDown,
  ChevronRight,
  PanelRightClose,
  Plus,
  Sparkles,
  X,
} from "lucide-react";
import {
  cityMeta,
  formatRuntime,
  formatTokens,
  formatYen,
  kindMeta,
  quickPrompts,
  sessionStatusMeta,
} from "../data";
import type { Session, Suggestion } from "../types";
import { KindIcon } from "./KindIcon";

/** Slack below the last message that still counts as "reading the latest". */
const NEAR_BOTTOM_PX = 40;

function isNearBottom(node: HTMLElement) {
  return node.scrollHeight - node.scrollTop - node.clientHeight <= NEAR_BOTTOM_PX;
}

function scrollToLatest(node: HTMLElement, smooth: boolean) {
  node.scrollTo({
    top: node.scrollHeight,
    behavior: smooth && !window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "smooth" : "auto",
  });
}

export function Companion({
  session,
  running,
  onSend,
  onAddSuggestion,
  onClose,
  onCollapse,
  agentOnline = true,
}: {
  session: Session;
  running: boolean;
  onSend: (prompt: string) => void;
  onAddSuggestion: (suggestion: Suggestion) => void;
  onClose?: () => void;
  onCollapse?: () => void;
  agentOnline?: boolean;
}) {
  const { trip, messages, usage, thinking } = session;
  const thinkingStepsId = useId();
  const [value, setValue] = useState("");
  const [openThinking, setOpenThinking] = useState(() => window.matchMedia("(min-width: 1280px)").matches);
  const scrollRef = useRef<HTMLDivElement>(null);
  const previousCount = useRef(messages.length);
  // Whether the reader was already at the live edge. Updated from scroll events
  // only, so a growing scrollHeight can never fake "they are reading history".
  const pinnedRef = useRef(true);
  const lastScrollTop = useRef(0);
  const scrollFrame = useRef(0);
  const measureFrame = useRef(0);
  const composingRef = useRef(false);
  const compositionEndedAt = useRef(0);
  const [pinned, setPinned] = useState(true);
  const [unread, setUnread] = useState(0);

  const status = sessionStatusMeta[session.status];
  const contextPercent =
    usage.contextMax > 0 ? Math.min(100, Math.round((usage.contextUsed / usage.contextMax) * 100)) : 0;
  const totalTokens = usage.inputTokens + usage.outputTokens;
  const doneSteps = thinking.filter((step) => step.status === "done").length;
  const thinkingOpen = running || openThinking;
  const statusLabel = running
    ? "Thinking"
    : session.sample
      ? session.draft
        ? "Saved local draft"
        : "Saved example"
      : session.status === "live"
        ? "Live session"
        : session.status === "saved"
          ? "Saved session"
          : "Local draft";

  useLayoutEffect(() => {
    const node = scrollRef.current;
    if (!node) return;
    lastScrollTop.current = node.scrollTop;
    scrollToLatest(node, false);
  }, []);

  useEffect(
    () => () => {
      if (scrollFrame.current) cancelAnimationFrame(scrollFrame.current);
      if (measureFrame.current) cancelAnimationFrame(measureFrame.current);
    },
    [],
  );

  // Fonts and late suggestion cards change height after paint; follow them only
  // while the reader is pinned, so history reading is never yanked.
  useLayoutEffect(() => {
    const node = scrollRef.current;
    if (!node || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => {
      if (pinnedRef.current) {
        node.scrollTop = node.scrollHeight;
        return;
      }
      if (isNearBottom(node)) {
        pinnedRef.current = true;
        setPinned(true);
        setUnread(0);
      }
    });
    if (node.firstElementChild) observer.observe(node.firstElementChild);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const node = scrollRef.current;
    const previous = previousCount.current;
    previousCount.current = messages.length;
    if (!node || messages.length <= previous) return;

    if (!pinnedRef.current) {
      setUnread((count) => count + (messages.length - previous));
      return;
    }
    if (scrollFrame.current) cancelAnimationFrame(scrollFrame.current);
    scrollFrame.current = requestAnimationFrame(() => {
      scrollFrame.current = 0;
      const target = scrollRef.current;
      if (target && pinnedRef.current) scrollToLatest(target, true);
    });
  }, [messages]);

  useEffect(() => {
    if (running) setOpenThinking(true);
  }, [running]);

  useEffect(() => {
    if (!running || !pinnedRef.current) return;
    const frame = requestAnimationFrame(() => {
      const node = scrollRef.current;
      if (node && pinnedRef.current) scrollToLatest(node, true);
    });
    return () => cancelAnimationFrame(frame);
  }, [running]);

  const handleScroll = () => {
    if (measureFrame.current) return;
    measureFrame.current = requestAnimationFrame(() => {
      measureFrame.current = 0;
      const node = scrollRef.current;
      if (!node) return;
      const top = node.scrollTop;
      const previousTop = lastScrollTop.current;
      lastScrollTop.current = top;

      if (isNearBottom(node)) {
        if (!pinnedRef.current) {
          pinnedRef.current = true;
          setPinned(true);
          setUnread(0);
        }
        return;
      }
      // A smooth scroll we started ourselves only ever moves down, so an
      // upward move is the one that means "the reader left the live edge".
      if (pinnedRef.current && top < previousTop - 1) {
        pinnedRef.current = false;
        setPinned(false);
      }
    });
  };

  const jumpToLatest = () => {
    pinnedRef.current = true;
    setPinned(true);
    setUnread(0);
    const node = scrollRef.current;
    if (node) scrollToLatest(node, true);
  };

  const send = () => {
    const prompt = value.trim();
    if (!prompt || running) return;
    pinnedRef.current = true;
    setPinned(true);
    setUnread(0);
    setValue("");
    onSend(prompt);
  };

  return (
    <aside className="flex h-full min-h-0 w-full flex-col border-l border-line bg-surface-1 xl:w-full">
      <header className="flex h-[52px] shrink-0 items-center justify-between gap-2 border-b border-hairline bg-surface-1 px-4">
        <div className="flex min-w-0 items-center gap-2.5">
          <span
            className={`h-1.5 w-1.5 shrink-0 rounded-full ${running ? "animate-breathe bg-clay" : status.dotClass}`}
            aria-hidden="true"
          />
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h2 className="truncate text-[13px] font-semibold leading-4 text-ink">{session.title}</h2>
              {session.sample && (
                <span className="shrink-0 rounded-full bg-black/[.05] px-1.5 py-0.5 font-mono text-[11px] uppercase tracking-[0.04em] text-muted">
                  Sample
                </span>
              )}
              {session.draft && (
                <span className="shrink-0 rounded-full bg-sun-soft px-1.5 py-0.5 font-mono text-[11px] uppercase tracking-[0.04em] text-clay-ink">
                  Draft
                </span>
              )}
            </div>
            <div className="mt-0.5 truncate font-mono text-[11px] leading-3 text-muted">
              {statusLabel} · {session.meta}
            </div>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-0.5">
          {onCollapse && (
            <button
              onClick={onCollapse}
              className="hidden h-8 w-8 place-items-center rounded-lg text-muted transition-colors hover:bg-black/[.04] hover:text-ink xl:grid"
              aria-label="Collapse chat panel"
              aria-expanded
              aria-controls="companion-panel"
              title="Collapse chat panel"
            >
              <PanelRightClose size={15} />
            </button>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="grid h-8 w-8 place-items-center rounded-lg text-muted transition-colors hover:bg-black/[.04] hover:text-ink xl:hidden"
              aria-label="Close conversation"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </header>

      <section aria-label="Session usage" className="shrink-0 border-b border-hairline px-4 py-3">
        <div className="flex items-center justify-between gap-2">
          <span className="font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-muted">
            Usage
          </span>
          <span className="max-w-[62%] truncate rounded-full bg-black/[.04] px-2 py-0.5 font-mono text-[11px] text-muted">
            {usage.model}
          </span>
        </div>
        <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-2">
          <div>
            <dt className="text-[11px] leading-4 text-muted">Tokens</dt>
            <dd className="text-[16px] font-semibold leading-5 tabular-nums text-ink">
              {formatTokens(totalTokens)}
            </dd>
            <dd className="font-mono text-[11px] leading-4 text-muted">
              {formatTokens(usage.inputTokens)} in · {formatTokens(usage.outputTokens)} out
            </dd>
          </div>
          <div>
            <dt className="text-[11px] leading-4 text-muted">Cost</dt>
            <dd className="text-[16px] font-semibold leading-5 tabular-nums text-ink">
              {usage.estimatedCostJpy > 0 ? formatYen(usage.estimatedCostJpy) : "—"}
            </dd>
            <dd className="font-mono text-[11px] leading-4 text-muted">estimated</dd>
          </div>
          <div className="col-span-2">
            <div className="flex items-center justify-between gap-2 text-[11px] leading-4 text-muted">
              <dt>Context</dt>
              <dd className="truncate font-mono tabular-nums">
                {contextPercent}% · {formatTokens(usage.contextUsed)} / {formatTokens(usage.contextMax)}
              </dd>
            </div>
            <div
              className="mt-1 h-[3px] overflow-hidden rounded-full bg-black/[.08]"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={contextPercent}
              aria-label="Context used"
            >
              <div className="h-full rounded-full bg-clay" style={{ width: `${contextPercent}%` }} />
            </div>
          </div>
          <div>
            <dt className="text-[11px] leading-4 text-muted">Runtime</dt>
            <dd className="text-[13px] font-medium leading-5 tabular-nums text-ink">
              {formatRuntime(usage.runtimeMs)}
            </dd>
          </div>
          <div>
            <dt className="text-[11px] leading-4 text-muted">Context left</dt>
            <dd className="text-[13px] font-medium leading-5 tabular-nums text-ink">
              {formatTokens(Math.max(0, usage.contextMax - usage.contextUsed))}
            </dd>
          </div>
        </dl>
      </section>

      {thinking.length > 0 && (
        <section className="shrink-0 border-b border-hairline" aria-label="Thinking stream">
          <button
            type="button"
            onClick={() => {
              if (!running) setOpenThinking((open) => !open);
            }}
            disabled={running}
            aria-expanded={thinkingOpen}
            aria-controls={thinkingStepsId}
            className="flex w-full items-center justify-between gap-2 px-4 py-2.5 text-left disabled:cursor-default"
          >
            <span className="flex min-w-0 items-center gap-2">
              {running ? (
                <span className="flex shrink-0 items-center gap-[3px]" aria-hidden="true">
                  <span className="thinking-dot h-[3px] w-[3px] rounded-full bg-clay" />
                  <span className="thinking-dot h-[3px] w-[3px] rounded-full bg-clay" />
                  <span className="thinking-dot h-[3px] w-[3px] rounded-full bg-clay" />
                </span>
              ) : (
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-clay" aria-hidden="true" />
              )}
              <span className="truncate text-[12px] font-medium text-ink">
                {running ? "Thinking…" : `Thought for ${formatRuntime(usage.runtimeMs)}`}
              </span>
              <span className="shrink-0 font-mono text-[11px] text-muted">
                {doneSteps}/{thinking.length}
              </span>
            </span>
            <ChevronDown
              size={14}
              className={`shrink-0 text-muted transition-transform duration-200 ${
                thinkingOpen ? "rotate-180" : ""
              }`}
              aria-hidden="true"
            />
          </button>
          <div
            id={thinkingStepsId}
            className={`grid transition-[grid-template-rows] duration-200 ease-[cubic-bezier(0.19,1,0.22,1)] ${
              thinkingOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
            }`}
          >
            <div className="min-h-0 overflow-hidden">
              <ol className="space-y-2.5 px-4 pb-3">
                {thinking.map((step) => (
                  <li key={step.id} className="flex gap-2.5">
                    <span className="mt-[2px] grid h-3.5 w-3.5 shrink-0 place-items-center">
                      {step.status === "done" ? (
                        <Check size={12} className="text-moss" aria-hidden="true" />
                      ) : step.status === "active" ? (
                        <span className="h-1.5 w-1.5 animate-breathe rounded-full bg-clay" aria-hidden="true" />
                      ) : (
                        <span className="h-2 w-2 rounded-full border border-line" aria-hidden="true" />
                      )}
                      <span className="sr-only">
                        {step.status === "done"
                          ? "Done: "
                          : step.status === "active"
                            ? "In progress: "
                            : "Pending: "}
                      </span>
                    </span>
                    <span className="min-w-0">
                      <span
                        className={`block text-[12px] leading-4 ${
                          step.status === "active" ? "font-medium text-clay-ink" : "text-ink"
                        }`}
                      >
                        {step.label}
                      </span>
                      <span className="block font-mono text-[11px] leading-4 text-muted">{step.detail}</span>
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>
      )}

      <div className="relative min-h-0 flex-1">
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          role="log"
          aria-live="polite"
          aria-relevant="additions"
          aria-busy={running}
          aria-label={`Conversation with Wander about ${session.title}`}
          className="h-full overflow-y-auto overscroll-contain px-4 py-4"
        >
          <div className="space-y-5">
            {messages.length === 0 && !running && (
              <div className="flex min-h-full flex-col justify-center py-8">
                <p className="font-display text-[28px] leading-tight text-ink">Where should we start?</p>
                <p className="mt-2 text-[13px] leading-5 text-muted">
                  This is a new branch of “{trip.title}”. Ask me to lighten a day, cut a cost, or protect
                  something you do not want to lose.
                </p>
              </div>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                className={`animate-msg-in flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {message.role === "user" ? (
                  <div className="max-w-[85%] rounded-[18px] bg-user-bubble px-4 py-3 text-[14px] leading-5 text-user-ink shadow-[0_1px_2px_rgba(0,0,0,.04)]">
                    {message.text}
                  </div>
                ) : (
                  <div className="w-full">
                    <div className="flex items-center gap-1.5 text-[11px] text-muted">
                      <span className="grid h-5 w-5 place-items-center rounded-lg bg-clay text-white">
                        <Sparkles size={11} />
                      </span>
                      <span className="font-medium text-ink">Wander</span>
                      <span className="rounded-full bg-black/[.04] px-1.5 py-0.5 font-mono text-[11px]">
                        {usage.model}
                      </span>
                      {message.source === "local" && <span className="font-mono">· local</span>}
                    </div>
                    <p className="mt-1.5 whitespace-pre-wrap text-[14px] leading-5 text-ink">
                      {message.text}
                    </p>
                    {message.suggestion && (
                      <SuggestionCard
                        suggestion={message.suggestion}
                        trip={trip}
                        onAdd={() => onAddSuggestion(message.suggestion!)}
                      />
                    )}
                  </div>
                )}
              </div>
            ))}

            {running && (
              <div className="animate-fade flex items-center gap-2 text-[11px] text-muted">
                <span className="grid h-6 w-6 place-items-center rounded-lg bg-clay text-white">
                  <Sparkles size={11} />
                </span>
                <span className="flex items-center gap-1 rounded-full bg-black/[.04] px-2.5 py-1.5">
                  <span className="typing-dot h-1 w-1 rounded-full bg-muted" />
                  <span className="typing-dot h-1 w-1 rounded-full bg-muted" />
                  <span className="typing-dot h-1 w-1 rounded-full bg-muted" />
                  <span className="ml-1">reading this tree…</span>
                </span>
              </div>
            )}
          </div>
        </div>

        {!pinned && (
          <div className="pointer-events-none absolute inset-x-0 bottom-2 flex justify-center">
            <button
              type="button"
              onClick={jumpToLatest}
              className="pointer-events-auto animate-pop flex items-center gap-1.5 rounded-full border border-line bg-surface-2 px-3 py-1.5 text-[11px] text-muted shadow-[0_1px_2px_rgba(0,0,0,.05),0_2px_8px_rgba(0,0,0,.08)] transition-colors hover:border-black/20 hover:text-ink"
            >
              {unread > 0 ? `${unread} new ${unread === 1 ? "message" : "messages"}` : "Jump to latest"}
              <ArrowDown size={11} />
            </button>
          </div>
        )}
      </div>

      <div className="shrink-0 border-t border-hairline bg-surface-1 px-4 pb-[max(12px,env(safe-area-inset-bottom))] pt-3">
        <div className="mb-2 flex gap-1.5 overflow-x-auto pb-0.5 no-scrollbar">
          {quickPrompts.slice(0, 3).map((prompt) => (
            <button
              key={prompt}
              onClick={() => onSend(prompt)}
              disabled={running}
              className="shrink-0 rounded-full bg-black/[.04] px-2.5 py-1.5 text-[11px] text-muted transition-colors hover:bg-black/[.07] hover:text-ink disabled:opacity-40"
            >
              {prompt}
            </button>
          ))}
        </div>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            if (composingRef.current) return;
            send();
          }}
          className="composer-shell rounded-xl bg-surface-2 p-2"
        >
          <textarea
            value={value}
            onChange={(event) => setValue(event.target.value)}
            onCompositionStart={() => {
              composingRef.current = true;
            }}
            onCompositionEnd={() => {
              composingRef.current = false;
              compositionEndedAt.current = Date.now();
            }}
            onKeyDown={(event) => {
              // CJK IME: Enter confirms a candidate, it must not send.
              // WebKit can fire keydown after compositionend, so keep a short guard.
              if (
                event.nativeEvent.isComposing ||
                event.keyCode === 229 ||
                composingRef.current ||
                Date.now() - compositionEndedAt.current < 500
              ) {
                return;
              }
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                send();
              }
            }}
            rows={2}
            placeholder="Ask about the plan, or change it…"
            aria-label="Message Wander"
            enterKeyHint="send"
            className="min-h-[48px] w-full resize-none bg-transparent px-1 py-1 text-[14px] leading-[1.45] text-ink outline-none placeholder:text-muted/60"
          />
          <div className="flex items-center justify-between gap-2 px-1 pb-0.5 pt-1">
            <span className="hidden text-[11px] text-muted sm:block">
              Enter to send · Shift+Enter for a new line
            </span>
            <span className="text-[11px] text-muted sm:hidden">Enter to send</span>
            <button
              type="submit"
              disabled={!value.trim() || running}
              className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-clay text-white transition-transform hover:bg-clay-deep active:scale-95 disabled:opacity-30"
              aria-label="Send message"
            >
              <ArrowUp size={14} />
            </button>
          </div>
        </form>
        <div className="mt-2 flex items-center justify-center gap-1.5 font-mono text-[11px] text-muted">
          <span
            className={`h-1 w-1 rounded-full ${
              session.sample ? "bg-muted/40" : agentOnline ? "bg-moss" : "bg-sun"
            }`}
            aria-hidden="true"
          />
          {session.sample
            ? "Saved example · no live calls"
            : agentOnline
              ? "Managed Agent · grounded in this tree"
              : "Local fallback · agent unavailable"}
        </div>
      </div>
    </aside>
  );
}

function SuggestionCard({
  suggestion,
  trip,
  onAdd,
}: {
  suggestion: Suggestion;
  trip: Session["trip"];
  onAdd: () => void;
}) {
  const day = trip.days.find((item) => item.id === suggestion.dayId);
  const city = day ? cityMeta[day.city] : null;
  const meta = kindMeta[suggestion.kind];
  return (
    <div className="mt-3 overflow-hidden rounded-xl border border-line bg-surface-2">
      <div className="flex items-center justify-between gap-2 border-b border-hairline px-3 py-2">
        <span className="flex items-center gap-1.5 font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-clay-ink">
          <Sparkles size={11} /> Proposed block
        </span>
        <span className="font-mono text-[11px] text-muted">
          Day {suggestion.dayId} · {city?.name}
        </span>
      </div>
      <div className="px-3 py-3">
        <div className="flex items-start gap-2.5">
          <div
            className="grid h-7 w-7 shrink-0 place-items-center rounded-lg"
            style={{ color: meta.tone, background: meta.soft }}
          >
            <KindIcon kind={suggestion.kind} size={13} />
          </div>
          <div className="min-w-0">
            <h4 className="text-[12px] font-medium leading-snug text-ink">{suggestion.title}</h4>
            <p className="mt-0.5 text-[11px] leading-4 text-muted">{suggestion.place}</p>
            <p className="mt-1 font-mono text-[11px] text-muted">
              {suggestion.start} · {suggestion.duration} min ·{" "}
              {suggestion.cost ? formatYen(suggestion.cost) : "free"}
            </p>
          </div>
        </div>
        <p className="mt-2 text-[11px] leading-4 text-muted">{suggestion.note}</p>
        <button
          onClick={onAdd}
          className="mt-3 flex w-full items-center justify-between rounded-lg bg-black/[.04] px-2.5 py-2 text-[11px] text-ink transition-colors hover:bg-black/[.07]"
        >
          <span className="flex items-center gap-1.5">
            <Plus size={11} /> Add to Day {suggestion.dayId}
          </span>
          <ChevronRight size={12} className="text-muted" />
        </button>
      </div>
    </div>
  );
}
