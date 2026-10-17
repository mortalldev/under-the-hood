"use client";

import { parseUnionFind, unionFindCode, unionFindSteps } from "@/visualizer/algorithms/union-find";
import { treeLayout } from "@/visualizer/core/layout";
import type { Tone } from "@/visualizer/core/types";
import { ArrayView, GraphView, TimelineView } from "../primitives";
import { useL } from "../useL";
import { Visualizer } from "../Visualizer";

export function UnionFindViz() {
  const l = useL();
  return (
    <Visualizer
      title={{ en: "Union-Find with path compression and union by rank", uz: "Path compression va union by rank bilan Union-Find" }}
      code={unionFindCode}
      defaultInput="1-2, 3-4, 2-3, 5-6, 6-7, 4-7, 1-4"
      parse={parseUnionFind}
      generate={unionFindSteps}
      inputLabel={{ en: "Edges to union, in order", uz: "Tartib bilan union qilinadigan edge'lar" }}
      render={(s) => {
        const ids = s.nodes.map((_, i) => String(i));
        const roots = ids.filter((_, i) => s.parent[i] === i);
        const kids = (id: string) => (id === "virtual" ? roots : ids.filter((c, i) => s.parent[i] === Number(id) && c !== id));
        const pos = treeLayout("virtual", kids);
        const tones: Partial<Record<number, Tone>> = {};
        for (const p of s.path) tones[p] = "compare";
        if (s.roots) for (const r of s.roots) tones[r] = "active";
        return (
          <div className="flex flex-col gap-4">
            <GraphView
              directed
              nodes={ids.map((id, i) => ({ id, x: pos[id].x, y: pos[id].y, label: s.nodes[i], tone: tones[i], badge: s.parent[i] === i ? `r${s.rank[i]}` : undefined }))}
              edges={ids.filter((_, i) => s.parent[i] !== i).map((id) => ({ from: id, to: String(s.parent[Number(id)]), tone: s.path.includes(Number(id)) ? "compare" : undefined }))}
            />
            <ArrayView label="parent" items={s.parent.map((p) => s.nodes[p])} keys={s.nodes} tones={tones} showIndex={false} />
            <ArrayView label={l("node", "node")} items={s.nodes} showIndex={false} />
            <TimelineView label={l("cycle-closing edges", "cycle yopuvchi edge'lar")} entries={s.redundant.map(([a, b]) => `${a}–${b}`)} highlightLast={false} />
          </div>
        );
      }}
    />
  );
}
