"use client";

import { heapLayout } from "@/visualizer/core/layout";
import type { Tone } from "@/visualizer/core/types";
import { ArrayView } from "./ArrayView";
import { GraphView, type GraphEdge, type GraphNode } from "./GraphView";

/** A binary heap shown both as its backing array and as the implied tree. */
export function HeapView({
  heap,
  tones = {},
  label,
}: {
  heap: readonly number[];
  tones?: Partial<Record<number, Tone>>;
  label?: string;
}) {
  const pos = heapLayout(heap.length);
  const nodes: GraphNode[] = heap.map((v, i) => ({
    id: String(i),
    x: pos[i].x,
    y: pos[i].y,
    label: String(v),
    tone: tones[i],
  }));
  const edges: GraphEdge[] = heap.slice(1).map((_, k) => {
    const i = k + 1;
    const parent = Math.floor((i - 1) / 2);
    const hot = tones[i] && tones[parent] ? tones[i] : undefined;
    return { from: String(parent), to: String(i), tone: hot };
  });

  return (
    <div className="flex flex-col gap-3">
      {heap.length > 0 ? (
        <GraphView nodes={nodes} edges={edges} label={label} />
      ) : (
        <p className="text-sm text-fg-subtle">{label}: ∅</p>
      )}
      <ArrayView items={heap} tones={tones} />
    </div>
  );
}
