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
