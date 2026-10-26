export type BlockKind = "travel" | "stay" | "explore" | "food" | "reset";

export type CityKey = "kyoto" | "nara" | "osaka" | "uji" | "kix";

export type Block = {
  id: string;
  dayId: number;
  kind: BlockKind;
  title: string;
  place: string;
  start: string;
  duration: number;
  cost: number;
  note: string;
  locked?: boolean;
};

export type Day = {
  id: number;
  label: string;
  date: string;
  month: string;
  city: CityKey;
  title: string;
};

export type Trip = {
  title: string;
  subtitle: string;
  startDate: string;
  days: Day[];
  travelers: number;
  budget: number;
  pace: "Slow" | "Balanced" | "Full";
  blocks: Block[];
  positions?: Record<string, { x: number; y: number }>;
};

export type ChatRole = "assistant" | "user";

export type ChatMessage = {
  id: string;
  role: ChatRole;
  text: string;
  pending?: boolean;
  suggestion?: Suggestion;
  source?: "managed-agent" | "local";
};

export type Suggestion = {
  title: string;
  place: string;
  kind: BlockKind;
  dayId: number;
  start: string;
  duration: number;
  cost: number;
  note: string;
};

/** How a conversation is stored. `saved` and `local` are always read-only samples. */
export type SessionStatus = "live" | "saved" | "local";

export type SessionUsage = {
  model: string;
  inputTokens: number;
  outputTokens: number;
  estimatedCostJpy: number;
  runtimeMs: number;
  contextUsed: number;
  contextMax: number;
};

export type ThinkingStatus = "active" | "done" | "pending";

export type ThinkingStep = {
  id: string;
  label: string;
  detail: string;
  status: ThinkingStatus;
};

/**
 * A conversation owns its own tree. Nothing about the centre canvas, the
 * transcript, usage or the thinking stream is shared between sessions.
 */
export type Session = {
  id: string;
  title: string;
  /** Short agent/context label shown under the title. */
  meta: string;
  /** Relative time label, e.g. "2m ago". */
  time: string;
  status: SessionStatus;
  /** Seed transcripts are fictional saved examples, never live calls. */
  sample?: boolean;
  /** A locally saved draft with no live agent behind it. */
  draft?: boolean;
  trip: Trip;
  messages: ChatMessage[];
  usage: SessionUsage;
  thinking: ThinkingStep[];
};
