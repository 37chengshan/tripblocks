import { memo, useCallback, useEffect, useMemo, useState } from "react";
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
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { LayoutGrid, Lock, MapPin, Plus, RefreshCcw } from "lucide-react";
import { cityMeta, formatTime, formatYen, kindMeta, parseMinutes } from "../data";
import type { Block, Day, Trip } from "../types";
import { KindIcon } from "./KindIcon";

const DAY_WIDTH = 248;
const DAY_X = 360;
const BLOCK_X = DAY_X + DAY_WIDTH + 68;
const BLOCK_PITCH = DAY_WIDTH + 20;
const ROW_PITCH = 118;
const BLOCK_OFFSET_Y = 11;

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

const statusDot: Record<"moss" | "clay" | "sun", string> = {
  moss: "#53624d",
  clay: "#bd6040",
  sun: "#dba64d",
};

const TripNodeView = memo(function TripNodeView({ data }: NodeProps<TripFlowNode>) {
  const { trip, spent } = data;

  return (
    <div className="w-[272px] rounded-2xl border border-clay/25 bg-card/85 px-4 py-4 shadow-[0_18px_40px_-32px_rgba(72,50,32,.65)] backdrop-blur-sm">
      <div className="flex items-center gap-1.5 text-[8.5px] font-medium tracking-[0.18em] text-faint">
        <span className="h-1 w-1 rounded-full bg-clay" /> TRIP ROOT
      </div>
      <h3 className="mt-2 font-display text-[26px] leading-[1.02]">{trip.title}</h3>
      <p className="mt-1.5 text-[10px] leading-relaxed text-muted">{trip.subtitle}</p>

      <div className="mt-3 space-y-1.5 border-t border-line/60 pt-2.5 text-[9.5px] text-muted">
        <div className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: statusDot.moss }} />
            {trip.days.length} days · {trip.blocks.length} blocks
          </span>
          <span className="tabular-nums text-faint">{trip.pace} pace</span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: statusDot.clay }} />
            {formatYen(spent)}
          </span>
          <span className="tabular-nums text-faint">of {formatYen(trip.budget)}</span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: statusDot.sun }} />
            {trip.travelers} travellers
          </span>
          <span className="flex items-center gap-1 text-clay/80">
            <span className="h-1 w-1 rounded-full bg-clay" /> live graph
          </span>
        </div>
      </div>

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
      onClick={() => onActivateDay(day.id)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onActivateDay(day.id);
        }
      }}
      className={`w-[248px] select-none rounded-2xl border bg-card/85 px-3.5 py-3 text-left backdrop-blur-sm transition-[border-color,box-shadow] duration-200 ease-out ${
        active
          ? "border-clay/45 shadow-[0_12px_30px_-24px_rgba(80,50,30,.6)]"
          : "border-line/80 shadow-[0_1px_0_rgba(255,255,255,.6)_inset] hover:border-clay/25"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2.5">
          <span className="font-display text-[28px] leading-none text-ink">{day.date}</span>
          <div className="min-w-0 pt-0.5">
            <div className="text-[8.5px] font-medium tracking-[0.16em] text-faint">
              {day.month} · DAY {String(day.id).padStart(2, "0")}
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-[10px] text-muted">
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: meta.ink }} />
              {meta.name} · {day.label}
            </div>
            <div className="mt-0.5 truncate text-[9.5px] text-faint">{day.title}</div>
          </div>
        </div>
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onAddDay(day.id);
          }}
          onPointerDown={(event) => event.stopPropagation()}
          aria-label={`Add a block to Day ${day.id}`}
          className="nodrag grid h-6 w-6 shrink-0 place-items-center rounded-full border border-line/80 bg-paper/40 text-faint transition hover:border-clay/40 hover:text-clay"
        >
          <Plus size={12} />
        </button>
      </div>

      <div className="mt-2.5 flex items-center gap-2 border-t border-line/50 pt-2 text-[9px] tabular-nums text-faint">
        <span className={active ? "text-clay" : ""}>
          {count} {count === 1 ? "node" : "nodes"}
        </span>
        <span className="h-2.5 w-px bg-line/70" />
        <span>{Math.round(minutes / 60)}h</span>
        <span className="h-2.5 w-px bg-line/70" />
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
      onClick={() => onSelect(block.id)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect(block.id);
        }
      }}
      style={{ borderLeft: `3px solid ${meta.tone}` }}
      className={`group w-[248px] cursor-grab rounded-[14px] border bg-card px-3 py-2.5 text-left transition-[border-color,box-shadow] duration-200 ease-out active:cursor-grabbing ${
        selected
          ? "border-clay/50 shadow-[0_16px_34px_-26px_rgba(96,62,38,.8)] ring-2 ring-clay/15"
          : "border-line/80 shadow-[0_1px_0_rgba(255,255,255,.65)_inset] hover:border-clay/30 hover:shadow-[0_12px_26px_-24px_rgba(60,45,28,.6)]"
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <span
          className="flex items-center gap-1 text-[8.5px] font-medium uppercase tracking-[0.09em]"
          style={{ color: meta.tone }}
        >
          <KindIcon kind={block.kind} size={11} /> {meta.label}
        </span>
        <span className="flex items-center gap-1 text-[9px] tabular-nums text-faint">
          {block.locked && <Lock size={9} className="text-[#a8863f]" aria-hidden />}
          {block.start} · {block.duration}m
        </span>
      </div>

      <div className="mt-1.5 truncate text-[13.5px] font-medium leading-snug text-ink">{block.title}</div>

      <div className="mt-1 flex items-center justify-between gap-2">
        <span className="flex min-w-0 items-center gap-1 text-[10px] text-muted">
          <MapPin size={9} className="shrink-0 text-faint" aria-hidden />
          <span className="truncate">{block.place}</span>
        </span>
        <span className="shrink-0 text-[10px] tabular-nums text-muted">
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

function initialViewport() {
  const width = typeof window === "undefined" ? 1280 : window.innerWidth;
  const zoom = width < 640 ? 0.55 : width < 1280 ? 0.62 : 0.65;
  return { x: width < 640 ? 14 : 28, y: 16, zoom };
}

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

function buildEdges(trip: Trip): CanvasEdge[] {
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
            style: { stroke: "#b99d85", strokeWidth: 1.55 },
            markerEnd: { type: MarkerType.ArrowClosed, width: 10, height: 10, color: "#a98d75" },
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
            style: { stroke: "#bfa68d", strokeWidth: 1.5 },
            markerEnd: { type: MarkerType.ArrowClosed, width: 10, height: 10, color: "#a98d75" },
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
      style: { stroke: "#c8b7a1", strokeWidth: 1.4 },
      markerEnd: { type: MarkerType.ArrowClosed, width: 9, height: 9, color: "#ad9a83" },
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
        style: { stroke: "#c78d75", strokeWidth: 1.5 },
        markerEnd: { type: MarkerType.ArrowClosed, width: 9, height: 9, color: "#b77b63" },
        selectable: false,
        focusable: false,
        zIndex: 0,
      });
    });
  });

  return edges;
}

export function CanvasBoard({
  trip,
  selectedId,
  onSelect,
  onAdd,
  onMove,
  onResetLayout,
  onBoard,
}: CanvasBoardProps) {
  const [activeDay, setActiveDay] = useState(() => trip.days[0]?.id ?? 1);
  const [flow, setFlow] = useState<ReactFlowInstance<AppNode, CanvasEdge> | null>(null);
  const [fitToken, setFitToken] = useState(0);
  const [startViewport] = useState(initialViewport);

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

  const [nodes, setNodes] = useState<AppNode[]>(layoutNodes);

  useEffect(() => {
    setNodes(layoutNodes);
  }, [layoutNodes]);

  const edges = useMemo(() => buildEdges(trip), [trip]);

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

  useEffect(() => {
    if (!fitToken || !flow) return;
    const frame = requestAnimationFrame(() => {
      void flow.setViewport({ ...startViewport, zoom: Math.max(startViewport.zoom, 0.72) }, { duration: 320 });
    });
    return () => cancelAnimationFrame(frame);
  }, [fitToken, flow, startViewport]);

  function resetLayout() {
    onResetLayout();
    setFitToken((token) => token + 1);
  }

  return (
    <div className="animate-in flex h-full min-h-0 w-full min-w-0 flex-col">
      <header className="flex shrink-0 flex-wrap items-end justify-between gap-3 border-b border-line/60 px-4 pb-4 pt-5 md:px-7">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-[10px] font-medium tracking-[0.16em] text-faint">
            <span className="h-px w-4 bg-line" /> WEEK CANVAS
          </div>
          <h2 className="mt-1.5 font-display text-[28px] leading-none">Move a node. The week changes.</h2>
          <p className="mt-1.5 text-[10.5px] leading-relaxed text-muted">
            Day 1 runs into Day 2, and each day runs block by block. Drag a card, click to edit — every change lands here.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pb-0.5 text-[9.5px] text-muted">
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-moss" /> Saved on this device
          </span>
          <span className="text-line">|</span>
          <span className="tabular-nums">{trip.blocks.length} nodes</span>
          <span className="tabular-nums">{trip.days.length} days</span>
          <span className="tabular-nums font-medium text-ink">{formatYen(spent)}</span>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col px-4 pb-3 pt-3 md:px-7">
        <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-y border-line/60 py-2.5">
          <div className="flex flex-wrap items-center gap-2">
            <label className="flex items-center gap-1.5 text-[10px] text-faint">
              <span className="sr-only">Day for the new node</span>
              <select
                value={activeDay}
                onChange={(event) => activateDay(Number(event.target.value))}
                className="rounded-full border border-line/80 bg-card/60 py-1.5 pl-2.5 pr-1 text-[10px] text-ink outline-none transition focus:border-clay/50"
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
              className="flex items-center gap-1.5 rounded-full bg-clay px-3 py-1.5 text-[10.5px] font-medium text-white transition-colors duration-200 hover:bg-clay-deep"
            >
              <Plus size={12} /> Add to Day {activeDay}
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={resetLayout}
              className="flex items-center gap-1.5 rounded-full border border-line/80 bg-card/55 px-3 py-1.5 text-[10.5px] text-muted transition-colors duration-200 hover:border-clay/30 hover:text-clay"
            >
              <RefreshCcw size={12} /> Auto layout
            </button>
            <button
              type="button"
              onClick={onBoard}
              className="flex items-center gap-1.5 rounded-full border border-line/80 bg-card/55 px-3 py-1.5 text-[10.5px] text-muted transition-colors duration-200 hover:border-clay/30 hover:text-clay"
            >
              <LayoutGrid size={12} /> Board view
            </button>
          </div>
        </div>

        <div className="tripblocks-canvas relative mt-3 min-h-0 w-full flex-1 overflow-hidden rounded-2xl border border-line/70 bg-surface-0">
          <ReactFlow<AppNode, CanvasEdge>
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            onNodesChange={handleNodesChange}
            onNodeDragStop={handleDragStop}
            onInit={handleInit}
            defaultViewport={startViewport}
            minZoom={0.2}
            maxZoom={1.5}
            nodeDragThreshold={3}
            onlyRenderVisibleElements
            nodesConnectable={false}
            nodesFocusable={false}
            elementsSelectable={false}
            className="[&_.react-flow__pane]:cursor-grab"
          >
            <Background variant={BackgroundVariant.Dots} gap={22} size={1.1} />
            <MiniMap
              position="bottom-right"
              pannable
              zoomable
              ariaLabel="Trip minimap"
              style={{ width: 108, height: 70 }}
              className="!m-3 hidden sm:block opacity-90"
            />
            <Controls position="bottom-left" showInteractive={false} />
          </ReactFlow>
        </div>

        <div className="flex shrink-0 flex-wrap items-center justify-between gap-x-4 gap-y-1 py-2.5 text-[9px] text-faint">
          <span>Drag a card across day rows to reschedule · move it left or right to reorder · click to edit.</span>
          <span>Scroll to zoom · drag the canvas to pan · Auto layout resets positions.</span>
        </div>
      </div>
    </div>
  );
}
