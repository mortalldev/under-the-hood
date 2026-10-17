"use client";

import { treeLayout } from "@/visualizer/core/layout";
import type { Tone } from "@/visualizer/core/types";
import { GraphView, type GraphEdge, type GraphNode } from "./GraphView";

export interface TreeNodeSpec {
  id: string;
  label: string;
  children: readonly (string | null)[];
  tone?: Tone;
  badge?: string;
}

/**
 * Rooted tree. For binary trees pass `[left, right]` children with `null` for a
 * missing side: a hidden placeholder keeps left/right visually distinct.
 */
export function TreeView({
  nodes,
  root,
  label,
  edgeTones,
}: {
  nodes: readonly TreeNodeSpec[];
  root: string | null;
  label?: string;
  edgeTones?: Partial<Record<string, Tone>>;
}) {
  if (root === null) {
    return <p className="text-sm text-fg-subtle">∅</p>;
  }
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const children = (id: string): string[] => {
    const n = byId.get(id);
    if (!n) return [];
    const real = n.children.filter((c): c is string => c !== null);
    if (real.length === 0) return [];
    return n.children.map((c, i) => c ?? `${id}::ghost${i}`);
  };
  const positions = treeLayout(root, children);

  const graphNodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];
  for (const [id, p] of Object.entries(positions)) {
    const n = byId.get(id);
    if (!n) continue;
    graphNodes.push({ id, x: p.x, y: p.y, label: n.label, tone: n.tone, badge: n.badge });
    for (const c of n.children) {
      if (c !== null && byId.has(c)) edges.push({ from: id, to: c, tone: edgeTones?.[`${id}>${c}`] });
    }
  }
  return <GraphView nodes={graphNodes} edges={edges} label={label} />;
}
