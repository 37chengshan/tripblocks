import { BedDouble, Compass, Leaf, TrainFront, Utensils } from "lucide-react";
import type { BlockKind } from "../types";

const icons = {
  travel: TrainFront,
  stay: BedDouble,
  explore: Compass,
  food: Utensils,
  reset: Leaf,
};

export function KindIcon({ kind, size = 15, className }: { kind: BlockKind; size?: number; className?: string }) {
  const Icon = icons[kind];
  return <Icon size={size} strokeWidth={1.8} className={className} />;
}
