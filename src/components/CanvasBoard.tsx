import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";
import {
  Background,
  BackgroundVariant,
  Controls,
  Handle,
  MarkerType,
  MiniMap,
  Position,
  ReactFlow,
  applyNodeChanges,
  type Edge,
  type Node,
  type NodeChange,
  type NodeProps,
  type NodeTypes,
  type ReactFlowInstance,
  type Viewport,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { LayoutGrid, Lock, MapPin, Maximize2, Plus, RefreshCcw } from "lucide-react";
import { cityMeta, formatTime, formatYen, kindMeta, parseMinutes } from "../data";
import type { Block, Day, Trip } from "../types";
import { KindIcon } from "./KindIcon";

/* Compact geometry: the graph has to read inside a ~720px centre pane, so the
   day column is 208px and blocks pitch 224px instead of the old 248/268. */
const DAY_WIDTH = 208;
const DAY_X = 256;
const BLOCK_WIDTH = 208;
const BLOCK_X = DAY_X + DAY_WIDTH + 36;
const BLOCK_PITCH = BLOCK_WIDTH + 16;
const ROW_PITCH = 148;
const BLOCK_OFFSET_Y = 14;

const FIT_PADDING = 0.12;
const FIT_MAX_ZOOM = 0.85;
/* Below this container width a full-tree fit becomes a postage stamp, so the
   first frame keeps a readable scale anchored at the root instead. */
const NARROW_CANVAS = 560;
const NARROW_ZOOM = 0.45;
const READABLE_CANVAS = 900;
const READABLE_ZOOM = 0.8;

const CARD_SHADOW = "0 1px 2px rgba(0,0,0,0.05), 0 2px 8px rgba(0,0,0,0.08)";
const SELECTED_SHADOW =
  "0 0 0 1.5px #d97757, 0 0 6px rgba(217,119,87,0.25), 0 1px 2px rgba(0,0,0,0.05), 0 2px 8px rgba(0,0,0,0.08)";
const EDGE_NEUTRAL = "rgba(0,0,0,0.38)";
const EDGE_SELECTED = "#d97757";
const EDGE_MARKER_NEUTRAL = "rgba(0,0,0,0.46)";

type TripNodeData = {
  trip: Trip;
  spent: number;
};

type BlockNodeData = {
  block: Block;
  selected: boolean;
  onSelect: (id: string) => void;
};

type DayNodeData = {
  day: Day;
  count: number;
  cost: number;
  minutes: number;
  active: boolean;
  onAddDay: (dayId: number) => void;
  onActivateDay: (dayId: number) => void;
};

type TripFlowNode = Node<TripNodeData, "trip">;
type BlockFlowNode = Node<BlockNodeData, "block">;
type DayFlowNode = Node<DayNodeData, "day">;
type AppNode = TripFlowNode | BlockFlowNode | DayFlowNode;
type CanvasEdge = Edge & {
  pathOptions?: { borderRadius?: number; offset?: number };
};

const hiddenHandle = { opacity: 0 } as const;

const TripNodeView = memo(function TripNodeView({ data }: NodeProps<TripFlowNode>) {
  const { trip, spent } = data;

  return (
    <div
      className="w-[232px] rounded-xl border border-black/10 bg-white px-4 py-3.5"
      style={{ boxShadow: CARD_SHADOW }}
    >
      <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.12em] text-[#6d6b67]">
        <span className="h-1.5 w-1.5 rounded-full bg-clay" /> Trip root
      </div>
      <h3 className="mt-1.5 line-clamp-2 text-[15px] font-semibold leading-5 tracking-[-0.01em] text-ink">
        {trip.title}
      </h3>
      <p className="mt-1 line-clamp-2 text-[12px] leading-4 text-[#525252]">{trip.subtitle}</p>

      <dl className="mt-2.5 grid grid-cols-2 gap-x-3 gap-y-1.5 border-t border-black/[.06] pt-2.5 text-[11px] leading-4">
        <div>
          <dt className="text-[#6d6b67]">Days</dt>
          <dd className="tabular-nums text-ink">{trip.days.length}</dd>
        </div>
        <div>
          <dt className="text-[#6d6b67]">Blocks</dt>
          <dd className="tabular-nums text-ink">{trip.blocks.length}</dd>
        </div>
        <div>
          <dt className="text-[#6d6b67]">Planned</dt>
          <dd className="tabular-nums text-ink">{formatYen(spent)}</dd>
        </div>
        <div>
          <dt className="text-[#6d6b67]">Budget</dt>
          <dd className="tabular-nums text-[#525252]">{formatYen(trip.budget)}</dd>
        </div>
      </dl>

      <Handle type="source" position={Position.Right} id="root-out" isConnectable={false} style={hiddenHandle} />
    </div>
  );
});

const DayNodeView = memo(function DayNodeView({ data }: NodeProps<DayFlowNode>) {
  const { day, count, cost, minutes, active, onAddDay, onActivateDay } = data;
  const meta = cityMeta[day.city];

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`Day ${day.id}, ${day.label} ${day.date}, ${meta.name}`}
      aria-pressed={active}
      onClick={() => onActivateDay(day.id)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onActivateDay(day.id);
        }
      }}
      className={`w-[208px] select-none rounded-xl border bg-white px-3.5 py-2.5 text-left transition-[border-color,box-shadow] duration-150 ease-out ${
        active
          ? "border-clay shadow-[0_0_0_1px_rgba(217,119,87,0.35),0_1px_2px_rgba(0,0,0,0.05),0_2px_8px_rgba(0,0,0,0.08)]"
          : "border-black/10 shadow-[0_1px_2px_rgba(0,0,0,0.05),0_2px_8px_rgba(0,0,0,0.08)] hover:border-black/20"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-[26px] font-semibold leading-none tracking-[-0.02em] text-ink">{day.date}</span>
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onAddDay(day.id);
          }}
          onPointerDown={(event) => event.stopPropagation()}
          aria-label={`Add a block to Day ${day.id}`}
          className="nodrag grid h-6 w-6 shrink-0 place-items-center rounded-lg border border-black/10 bg-white text-[#6d6b67] transition-colors duration-150 hover:border-black/20 hover:bg-black/[.04] hover:text-ink"
        >
          <Plus size={13} />
        </button>
      </div>

      <div className="mt-1.5 text-[11px] font-medium uppercase tracking-[0.1em] text-[#6d6b67]">
        {day.month} · Day {String(day.id).padStart(2, "0")}
      </div>
      <div className="mt-1 flex items-center gap-1.5 text-[12px] leading-4 text-[#525252]">
        <span className={`h-1.5 w-1.5 rounded-full ${active ? "bg-clay" : "bg-[#8a8a8a]"}`} />
        <span className="truncate">
          {meta.name} · {day.label}
        </span>
      </div>
      <div className="mt-0.5 truncate text-[11px] leading-4 text-[#6d6b67]">{day.title}</div>

      <div className="mt-2 flex items-center gap-2 border-t border-black/[.06] pt-2 text-[11px] tabular-nums text-[#6d6b67]">
        <span className={active ? "text-clay-deep" : undefined}>
          {count} {count === 1 ? "block" : "blocks"}
        </span>
        <span className="h-2.5 w-px bg-black/10" />
        <span>{Math.round(minutes / 60)}h</span>
        <span className="h-2.5 w-px bg-black/10" />
        <span>{cost ? formatYen(cost) : "free"}</span>
      </div>

      <Handle type="target" position={Position.Left} id="day-left" isConnectable={false} style={hiddenHandle} />
      <Handle type="source" position={Position.Right} id="day-right" isConnectable={false} style={hiddenHandle} />
      <Handle type="target" position={Position.Top} id="day-in" isConnectable={false} style={hiddenHandle} />
      <Handle type="source" position={Position.Bottom} id="day-out" isConnectable={false} style={hiddenHandle} />
    </div>
  );
});

const BlockNodeView = memo(function BlockNodeView({ data }: NodeProps<BlockFlowNode>) {
  const { block, selected, onSelect } = data;
  const meta = kindMeta[block.kind];

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`${block.title}, ${block.start}, ${block.duration} minutes, Day ${block.dayId}${block.locked ? ", booked" : ""}`}
      aria-pressed={selected}
      onClick={() => onSelect(block.id)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect(block.id);
        }
      }}
      className={`group w-[208px] cursor-grab rounded-xl border bg-white px-3 py-2.5 text-left transition-[translate,border-color] duration-150 ease-out hover:-translate-y-[1.5px] active:cursor-grabbing ${
        selected ? "border-clay" : "border-black/10 hover:border-black/20"
      }`}
      style={{ boxShadow: selected ? SELECTED_SHADOW : CARD_SHADOW }}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 text-[11px] font-medium text-[#6d6b67]">
          <KindIcon kind={block.kind} size={12} className={selected ? "text-clay-deep" : "text-[#8a8a8a]"} />
          {meta.label}
        </span>
        <span className="flex items-center gap-1 text-[11px] tabular-nums text-[#6d6b67]">
          {block.locked && <Lock size={11} className="text-[#8a8a8a]" aria-hidden />}
          {block.start} · {block.duration}m
        </span>
      </div>

      <div className="mt-1.5 truncate text-[14px] font-medium leading-[1.3] text-ink">{block.title}</div>

      <div className="mt-1 flex items-center justify-between gap-2 text-[11px] text-[#525252]">
        <span className="flex min-w-0 items-center gap-1">
          <MapPin size={11} className="shrink-0 text-[#8a8a8a]" aria-hidden />
          <span className="truncate">{block.place}</span>
        </span>
        <span className="shrink-0 tabular-nums text-[#6d6b67]">
          {block.cost ? formatYen(block.cost) : "free"}
        </span>
      </div>

      <Handle type="target" position={Position.Left} id="block-left" isConnectable={false} style={hiddenHandle} />
      <Handle type="source" position={Position.Right} id="block-right" isConnectable={false} style={hiddenHandle} />
    </div>
  );
});

const nodeTypes: NodeTypes = {
  trip: TripNodeView,
  block: BlockNodeView,
  day: DayNodeView,
};

interface CanvasBoardProps {
  trip: Trip;
  selectedId: string | null;
  onSelect: (id: string) => void;
  onAdd: (dayId: number) => void;
  onMove: (
    id: string,
    position: { x: number; y: number },
    schedule?: { dayId: number; start: string },
  ) => void;
  onResetLayout: () => void;
  onBoard: () => void;
  /** Stable identity for the active conversation/session. Falls back to the trip itself. */
  sessionKey?: string;
  /** Optional per-session viewport supplied by the host. */
  initialViewport?: Viewport | null;
}

function orderedBlocks(blocks: Block[]): Block[] {
  return blocks
    .slice()
    .sort((a, b) => (a.start === b.start ? a.id.localeCompare(b.id) : a.start.localeCompare(b.start)));
}

function blocksByDay(trip: Trip): Map<number, Block[]> {
  const byDay = new Map<number, Block[]>();
  for (const block of trip.blocks) {
    const list = byDay.get(block.dayId);
    if (list) list.push(block);
    else byDay.set(block.dayId, [block]);
  }
  return byDay;
}

export function initialCanvasPosition(trip: Trip, block: Block): { x: number; y: number } {
  const dayIndex = Math.max(0, trip.days.findIndex((day) => day.id === block.dayId));
  const dayBlocks = orderedBlocks([...trip.blocks.filter((item) => item.dayId === block.dayId), block]);
  const order = Math.max(0, dayBlocks.findIndex((item) => item.id === block.id));
  return { x: BLOCK_X + order * BLOCK_PITCH, y: dayIndex * ROW_PITCH + BLOCK_OFFSET_Y };
}

function nodeXForBlock(trip: Trip, dayBlocks: Block[], block: Block): number {
  const saved = trip.positions?.[block.id];
  if (saved) return saved.x;
  const order = dayBlocks.findIndex((item) => item.id === block.id);
  return BLOCK_X + Math.max(0, order) * BLOCK_PITCH;
}

function deriveStart(others: Block[], insertIndex: number, duration: number): string {
  const previous = others[insertIndex - 1];
  const next = others[insertIndex];
  const previousEnd = previous ? parseMinutes(previous.start) + previous.duration : null;
  const nextStart = next ? parseMinutes(next.start) : null;

  let start: number;
  if (previous && previousEnd !== null && nextStart !== null) {
    const earliest = parseMinutes(previous.start) + 5;
    const latest = nextStart - 5;
    start = Math.max(earliest, Math.min(previousEnd + 10, latest));
  } else if (previousEnd !== null) {
    start = previousEnd + 15;
  } else if (nextStart !== null) {
    start = nextStart - duration - 15;
  } else {
    start = 9 * 60;
  }

  const bounded = Math.max(0, Math.min(23 * 60 + 55, start));
  return formatTime(Math.round(bounded / 5) * 5);
}

function buildNodes(
  trip: Trip,
  selectedId: string | null,
  activeDay: number,
  spent: number,
  onAddDay: (dayId: number) => void,
  onActivateDay: (dayId: number) => void,
  onSelect: (id: string) => void,
): AppNode[] {
  const byDay = blocksByDay(trip);
  const nodes: AppNode[] = [
    {
      id: "trip-root",
      type: "trip",
      position: { x: 0, y: 0 },
      data: { trip, spent },
      draggable: false,
      selectable: false,
      connectable: false,
      deletable: false,
      focusable: false,
      zIndex: 3,
    },
  ];

  trip.days.forEach((day, dayIndex) => {
    const blocks = orderedBlocks(byDay.get(day.id) ?? []);
    const y = dayIndex * ROW_PITCH;

    nodes.push({
      id: `day-${day.id}`,
      type: "day",
      position: { x: DAY_X, y },
      data: {
        day,
        count: blocks.length,
        cost: blocks.reduce((sum, block) => sum + block.cost, 0),
        minutes: blocks.reduce((sum, block) => sum + block.duration, 0),
        active: day.id === activeDay,
        onAddDay,
        onActivateDay,
      },
      draggable: false,
      selectable: false,
      connectable: false,
      deletable: false,
      focusable: false,
      zIndex: 2,
    });

    blocks.forEach((block, order) => {
      const saved = trip.positions?.[block.id];
      nodes.push({
        id: block.id,
        type: "block",
        position: saved
          ? { x: saved.x, y: saved.y }
          : { x: BLOCK_X + order * BLOCK_PITCH, y: y + BLOCK_OFFSET_Y },
        data: { block, selected: block.id === selectedId, onSelect },
        draggable: true,
        selectable: false,
        connectable: false,
        deletable: false,
        focusable: false,
        zIndex: 1,
      });
    });
  });

  return nodes;
}

function orderedForEdges(trip: Trip, dayBlocks: Block[]): Block[] {
  return dayBlocks
    .map((block, index) => ({ block, x: trip.positions?.[block.id]?.x ?? BLOCK_X + index * BLOCK_PITCH }))
    .sort((a, b) => a.x - b.x)
    .map((entry) => entry.block);
}

function edgePaint(active: boolean) {
  return {
    style: { stroke: active ? EDGE_SELECTED : EDGE_NEUTRAL, strokeWidth: active ? 1.6 : 1.3 },
    markerEnd: {
      type: MarkerType.ArrowClosed,
      width: 11,
      height: 11,
      color: active ? EDGE_SELECTED : EDGE_MARKER_NEUTRAL,
    },
  };
}

function buildEdges(trip: Trip, selectedId: string | null): CanvasEdge[] {
  const byDay = blocksByDay(trip);
  const edges: CanvasEdge[] = [];

  trip.days.forEach((day, dayIndex) => {
    const blocks = orderedForEdges(trip, orderedBlocks(byDay.get(day.id) ?? []));
    const previousDay = dayIndex > 0 ? trip.days[dayIndex - 1] : null;

    edges.push(
      previousDay
        ? {
            id: `chain-day-${previousDay.id}-${day.id}`,
            source: `day-${previousDay.id}`,
            sourceHandle: "day-out",
            target: `day-${day.id}`,
            targetHandle: "day-in",
            type: "smoothstep",
            pathOptions: { borderRadius: 16, offset: 16 },
            ...edgePaint(false),
            selectable: false,
            focusable: false,
            zIndex: 0,
          }
        : {
            id: "chain-root-day-1",
            source: "trip-root",
            sourceHandle: "root-out",
            target: `day-${day.id}`,
            targetHandle: "day-left",
            type: "smoothstep",
            pathOptions: { borderRadius: 18, offset: 18 },
            ...edgePaint(false),
            selectable: false,
            focusable: false,
            zIndex: 0,
          },
    );

    if (blocks.length === 0) return;

    edges.push({
      id: `day-entry-${day.id}`,
      source: `day-${day.id}`,
      sourceHandle: "day-right",
      target: blocks[0].id,
      targetHandle: "block-left",
      type: "smoothstep",
      pathOptions: { borderRadius: 14, offset: 14 },
      ...edgePaint(blocks[0].id === selectedId),
      selectable: false,
      focusable: false,
      zIndex: 0,
    });

    blocks.forEach((block, index) => {
      const next = blocks[index + 1];
      if (!next) return;
      edges.push({
        id: `seq-${block.id}-${next.id}`,
        source: block.id,
        sourceHandle: "block-right",
        target: next.id,
        targetHandle: "block-left",
        type: "smoothstep",
        pathOptions: { borderRadius: 14, offset: 14 },
        ...edgePaint(block.id === selectedId || next.id === selectedId),
        selectable: false,
        focusable: false,
        zIndex: 0,
      });
    });
  });

  return edges;
}

const CANVAS_VARS = {
  "--xy-background-color": "#f9f9f7",
  "--xy-edge-stroke": EDGE_NEUTRAL,
  "--xy-edge-stroke-selected": EDGE_SELECTED,
  "--xy-handle-background-color": "#ffffff",
  "--xy-handle-border-color": "rgba(0,0,0,0.16)",
  "--xy-minimap-background-color": "#ffffff",
  "--xy-minimap-mask-background-color": "rgba(249,249,247,0.74)",
  "--xy-minimap-node-background-color": "rgba(0,0,0,0.16)",
  "--xy-minimap-node-stroke-color": "transparent",
} as CSSProperties;

export function CanvasBoard({
  trip,
  selectedId,
  onSelect,
  onAdd,
  onMove,
  onResetLayout,
  onBoard,
  sessionKey,
  initialViewport,
}: CanvasBoardProps) {
  const tripKey = sessionKey ?? `${trip.title}|${trip.startDate}`;
  const [activeDay, setActiveDay] = useState(() => trip.days[0]?.id ?? 1);
  const [flow, setFlow] = useState<ReactFlowInstance<AppNode, CanvasEdge> | null>(null);
  const [nodes, setNodes] = useState<AppNode[]>(() =>
    buildNodes(trip, selectedId, trip.days[0]?.id ?? 1, 0, () => {}, () => {}, onSelect),
  );

  const wrapRef = useRef<HTMLDivElement | null>(null);
  const savedViewports = useRef(new Map<string, Viewport>());
  const pendingFit = useRef(true);
  const pendingRestore = useRef<Viewport | null>(null);
  const frames = useRef<number[]>([]);
  const previousKey = useRef(tripKey);

  const clearFrames = useCallback(() => {
    frames.current.forEach((frame) => cancelAnimationFrame(frame));
    frames.current = [];
  }, []);

  const frameViewport = useCallback(
    (duration = 0) => {
      if (!flow) return;
      const rect = wrapRef.current?.getBoundingClientRect();
      if (!rect) return;
      if (rect.width < NARROW_CANVAS) {
        void flow.setViewport({ x: 10, y: 10, zoom: NARROW_ZOOM }, { duration });
        return;
      }
      void flow.fitView({ padding: FIT_PADDING, maxZoom: FIT_MAX_ZOOM, duration });
    },
    [flow],
  );

  const frameReadable = useCallback(
    (duration = 0) => {
      if (!flow) return;
      const rect = wrapRef.current?.getBoundingClientRect();
      if (!rect) return;
      if (rect.width < NARROW_CANVAS) {
        void flow.setViewport({ x: 10, y: 10, zoom: NARROW_ZOOM }, { duration });
        return;
      }
      if (rect.width < READABLE_CANVAS) {
        void flow.setViewport({ x: 12, y: 8, zoom: READABLE_ZOOM }, { duration });
        return;
      }
      void flow.fitView({ padding: FIT_PADDING, maxZoom: FIT_MAX_ZOOM, duration });
    },
    [flow],
  );

  const runFit = useCallback(
    (duration = 0) => {
      if (!flow) return;
      clearFrames();
      const first = requestAnimationFrame(() => {
        const second = requestAnimationFrame(() => frameViewport(duration));
        frames.current.push(second);
      });
      frames.current.push(first);
    },
    [clearFrames, flow, frameViewport],
  );

  useEffect(() => clearFrames, [clearFrames]);

  const activateDay = useCallback((dayId: number) => setActiveDay(dayId), []);
  const addToDay = useCallback(
    (dayId: number) => {
      setActiveDay(dayId);
      onAdd(dayId);
    },
    [onAdd],
  );

  const spent = useMemo(() => trip.blocks.reduce((sum, block) => sum + block.cost, 0), [trip.blocks]);

  const layoutNodes = useMemo(
    () => buildNodes(trip, selectedId, activeDay, spent, addToDay, activateDay, onSelect),
    [trip, selectedId, activeDay, spent, addToDay, activateDay, onSelect],
  );

  useEffect(() => {
    setNodes(layoutNodes);
  }, [layoutNodes]);

  const edges = useMemo(() => buildEdges(trip, selectedId), [trip, selectedId]);

  const handleNodesChange = useCallback((changes: NodeChange<AppNode>[]) => {
    setNodes((current) => applyNodeChanges(changes, current));
  }, []);

  const handleDragStop = useCallback(
    (_event: MouseEvent | TouchEvent, node: AppNode) => {
      if (node.type !== "block") return;

      const position = { x: Math.round(node.position.x), y: Math.round(node.position.y) };
      const dayIndex = Math.max(
        0,
        Math.min(trip.days.length - 1, Math.round((position.y - BLOCK_OFFSET_Y) / ROW_PITCH)),
      );
      const targetDay = trip.days[dayIndex];

      if (!targetDay) {
        onMove(node.id, position);
        return;
      }

      const dayBlocks = orderedBlocks(blocksByDay(trip).get(targetDay.id) ?? []);
      const others = dayBlocks.filter((block) => block.id !== node.id);
      const visualOthers = others
        .map((block) => ({ block, x: nodeXForBlock(trip, dayBlocks, block) }))
        .sort((a, b) => a.x - b.x);
      const insertIndex = visualOthers.filter((entry) => entry.x < position.x).length;
      const currentIndex = dayBlocks.findIndex((block) => block.id === node.id);
      const unchanged = targetDay.id === node.data.block.dayId && insertIndex === currentIndex;

      onMove(
        node.id,
        position,
        unchanged
          ? undefined
          : { dayId: targetDay.id, start: deriveStart(others, insertIndex, node.data.block.duration) },
      );
    },
    [onMove, trip],
  );

  const handleInit = useCallback((instance: ReactFlowInstance<AppNode, CanvasEdge>) => {
    setFlow(instance);
  }, []);

  const handleMoveEnd = useCallback(
    (_event: MouseEvent | TouchEvent | null, viewport: Viewport) => {
      savedViewports.current.set(tripKey, viewport);
    },
    [tripKey],
  );

  /* A session switch must not inherit the previous trip's pan, zoom or day. */
  useEffect(() => {
    if (previousKey.current === tripKey) return;
    previousKey.current = tripKey;
    setActiveDay(trip.days[0]?.id ?? 1);
    const stored = savedViewports.current.get(tripKey) ?? null;
    if (stored) {
      pendingFit.current = false;
      pendingRestore.current = stored;
    } else {
      pendingRestore.current = null;
      pendingFit.current = true;
    }
  }, [tripKey, trip.days]);

  useEffect(() => {
    if (!flow) return;
    if (pendingRestore.current) {
      const viewport = pendingRestore.current;
      pendingRestore.current = null;
      const frame = requestAnimationFrame(() => {
        void flow.setViewport(viewport);
      });
      return () => cancelAnimationFrame(frame);
    }
    if (pendingFit.current) {
      pendingFit.current = false;
      frameReadable();
    }
  }, [nodes, flow, runFit]);

  useEffect(() => {
    if (!flow || !initialViewport) return;
    pendingFit.current = false;
    clearFrames();
    const frame = requestAnimationFrame(() => {
      void flow.setViewport(initialViewport);
    });
    return () => cancelAnimationFrame(frame);
  }, [flow, initialViewport, clearFrames]);

  /* The viewport is derived from the real canvas box, never from window width. */
  useEffect(() => {
    const node = wrapRef.current;
    if (!node || !flow) return;
    let frame = 0;
    const observer = new ResizeObserver(() => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => frameReadable(0));
    });
    observer.observe(node);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [flow, frameReadable]);

  function resetLayout() {
    onResetLayout();
    pendingFit.current = true;
  }

  return (
    <div className="flex h-full min-h-0 w-full min-w-0 flex-col bg-[#fcfcfb]">
      <style>{`
        .tripblocks-canvas .react-flow__controls-button { width: 32px; height: 32px; }
        .tripblocks-canvas .react-flow__controls-button svg { max-width: 14px; max-height: 14px; }
        .tripblocks-canvas .react-flow__pane { cursor: grab; }
        .tripblocks-canvas .react-flow__pane.dragging { cursor: grabbing; }
      `}</style>
      <header className="flex shrink-0 flex-col gap-2 border-b border-black/10 px-4 pb-2.5 pt-3 md:px-5">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h2 className="truncate text-[15px] font-semibold leading-5 tracking-[-0.01em] text-ink">
              {trip.title}
            </h2>
            <p className="mt-0.5 truncate text-[11px] leading-4 text-[#6d6b67]">
              {trip.days.length} days · {trip.blocks.length} blocks · {formatYen(spent)} of{" "}
              {formatYen(trip.budget)} planned
            </p>
          </div>
          <span className="flex shrink-0 items-center gap-1.5 text-[11px] text-[#6d6b67]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#10b981]" />
            Saved
          </span>
        </div>

        <div className="flex h-10 items-center gap-2 overflow-x-auto no-scrollbar">
          <label className="flex shrink-0 items-center">
            <span className="sr-only">Day for the new block</span>
            <select
              value={activeDay}
              onChange={(event) => activateDay(Number(event.target.value))}
              className="h-7 max-w-[168px] rounded-lg border border-black/10 bg-white px-2 text-[11px] text-ink outline-none transition-colors duration-150 focus:border-clay/60"
            >
              {trip.days.map((day) => (
                <option key={day.id} value={day.id}>
                  Day {day.id} · {day.label} {day.date}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            onClick={() => addToDay(activeDay)}
            className="flex h-7 shrink-0 items-center gap-1.5 rounded-lg bg-clay-deep px-2.5 text-[11px] font-medium text-white transition-colors duration-150 hover:bg-[#a34a2a]"
          >
            <Plus size={12} /> <span className="hidden sm:inline">Add to Day {activeDay}</span>
            <span className="sm:hidden">Add</span>
          </button>

          <div className="ml-auto flex shrink-0 items-center gap-1">
            <button
              type="button"
              onClick={() => runFit(200)}
              aria-label="Fit the graph to the canvas"
              title="Fit"
              className="flex h-7 items-center gap-1.5 rounded-lg px-2 text-[11px] text-[#525252] transition-colors duration-150 hover:bg-black/5 hover:text-ink"
            >
              <Maximize2 size={12} /> <span className="hidden sm:inline">Fit</span>
            </button>
            <button
              type="button"
              onClick={resetLayout}
              aria-label="Restore automatic layout"
              title="Auto layout"
              className="flex h-7 items-center gap-1.5 rounded-lg px-2 text-[11px] text-[#525252] transition-colors duration-150 hover:bg-black/5 hover:text-ink"
            >
              <RefreshCcw size={12} /> <span className="hidden sm:inline">Auto layout</span>
            </button>
            <button
              type="button"
              onClick={onBoard}
              aria-label="Open board view"
              title="Board"
              className="flex h-7 items-center gap-1.5 rounded-lg px-2 text-[11px] text-[#525252] transition-colors duration-150 hover:bg-black/5 hover:text-ink"
            >
              <LayoutGrid size={12} /> <span className="hidden sm:inline">Board</span>
            </button>
          </div>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col px-3 pb-2 pt-2 md:px-5">
        <div
          ref={wrapRef}
          className="tripblocks-canvas relative min-h-0 w-full flex-1 overflow-hidden rounded-xl border border-black/10 bg-[#f9f9f7]"
        >
          <ReactFlow<AppNode, CanvasEdge>
            key={tripKey}
            fitView
            fitViewOptions={{ padding: FIT_PADDING, maxZoom: FIT_MAX_ZOOM }}
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            onNodesChange={handleNodesChange}
            onNodeDragStop={handleDragStop}
            onInit={handleInit}
            onMoveEnd={handleMoveEnd}
            minZoom={0.15}
            maxZoom={1.4}
            nodeDragThreshold={3}
            nodesConnectable={false}
            nodesFocusable={false}
            elementsSelectable={false}
            style={CANVAS_VARS}
          >
            <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="rgba(0,0,0,0.12)" />
            <MiniMap
              position="bottom-right"
              pannable
              zoomable
              ariaLabel="Trip minimap"
              bgColor="#ffffff"
              nodeColor="rgba(0,0,0,0.16)"
              nodeStrokeColor="rgba(0,0,0,0.10)"
              nodeBorderRadius={4}
              maskColor="rgba(249,249,247,0.74)"
              style={{ width: 112, height: 72 }}
              className="!m-3 hidden rounded-[10px] sm:block"
            />
            <Controls position="bottom-left" showInteractive={false} />
          </ReactFlow>
        </div>

        <div className="flex shrink-0 flex-wrap items-center justify-between gap-x-4 gap-y-1 py-2 text-[11px] leading-4 text-[#6d6b67]">
          <span>Drag a card across day rows to reschedule · move it left or right to reorder.</span>
          <span className="tabular-nums">Scroll to zoom · drag to pan · Fit resets the view.</span>
        </div>
      </div>
    </div>
  );
}
