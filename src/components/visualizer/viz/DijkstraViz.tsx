"use client";

import { dijkstraCode, dijkstraSteps, parseDijkstra } from "@/visualizer/algorithms/dijkstra";
import { circleLayout } from "@/visualizer/core/layout";
import type { Tone } from "@/visualizer/core/types";
import { GraphView, QueueView } from "../primitives";
import { useL } from "../useL";
import { Visualizer } from "../Visualizer";

export function DijkstraViz() {
  const l = useL();
  return (
    <Visualizer
      title={{ en: "Dijkstra — shortest paths with a priority queue", uz: "Dijkstra — priority queue bilan eng qisqa yoʻllar" }}
      code={dijkstraCode}
      defaultInput="A-B:4, A-C:2, C-B:1, B-D:5, C-D:8, C-E:10, D-E:2, D-F:6, E-F:2; A"
      parse={parseDijkstra}
      generate={dijkstraSteps}
      inputLabel={{ en: "Weighted edges A-B:w; start", uz: "Vaznli edge'lar A-B:w; start" }}
      render={(s) => {
        const pos = circleLayout(s.nodes);
        const tone = (n: string): Tone => (n === s.current ? "active" : s.done.includes(n) ? "visited" : n in s.dist ? "window" : "default");
        const onPath = (a: string, b: string) => s.prev[b] === a || s.prev[a] === b;
        const relaxing = (a: string, b: string) => s.relax !== null && ((s.relax[0] === a && s.relax[1] === b) || (s.relax[0] === b && s.relax[1] === a));
        return (
          <div className="flex flex-col gap-4">
            <GraphView
              nodes={s.nodes.map((n) => ({ id: n, ...pos[n], tone: tone(n), badge: n in s.dist ? String(s.dist[n]) : "∞" }))}
              edges={s.edges.map((e) => ({
                from: e.from,
                to: e.to,
                label: String(e.weight),
                tone: relaxing(e.from, e.to) ? (s.improved ? "match" : "compare") : onPath(e.from, e.to) ? "visited" : undefined,
              }))}
            />
            <QueueView label={l("priority queue (dist, node)", "priority queue (masofa, node)")} items={s.pq.map(([d, n], i) => ({ id: `${d}-${n}-${i}`, label: `${d}·${n}`, tone: s.done.includes(n) ? "muted" : undefined }))} />
          </div>
        );
      }}
    />
  );
}
