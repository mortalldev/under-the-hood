"use client";

import { kruskalCode, kruskalSteps, parseKruskal } from "@/visualizer/algorithms/kruskal";
import { circleLayout } from "@/visualizer/core/layout";
import { GraphView, Stats } from "../primitives";
import { useL } from "../useL";
import { Visualizer } from "../Visualizer";

export function KruskalViz() {
  const l = useL();
  return (
    <Visualizer
      title={{ en: "Kruskal's MST — cheapest safe edge first", uz: "Kruskal MST — eng arzon xavfsiz edge birinchi" }}
      code={kruskalCode}
      defaultInput="A-B:4, A-C:1, B-C:2, B-D:5, C-D:8, D-E:3, C-E:9, A-E:7"
      parse={parseKruskal}
      generate={kruskalSteps}
      inputLabel={{ en: "Weighted edges A-B:w", uz: "Vaznli edge'lar A-B:w" }}
      render={(s) => {
        const pos = circleLayout(s.nodes);
        return (
          <div className="flex flex-col gap-4">
            <GraphView
              nodes={s.nodes.map((n) => ({ id: n, ...pos[n], badge: s.component[n] }))}
              edges={s.edges.map((e, k) => ({
                from: e.from,
                to: e.to,
                label: String(e.weight),
                tone: k === s.i ? "active" : s.accepted.includes(k) ? "found" : s.rejected.includes(k) ? "danger" : undefined,
                dashed: s.rejected.includes(k),
              }))}
            />
            <Stats items={[[l("MST weight", "MST vazni"), s.total], [l("edges", "edge'lar"), `${s.accepted.length}/${s.nodes.length - 1}`]]} />
          </div>
        );
      }}
    />
  );
}
