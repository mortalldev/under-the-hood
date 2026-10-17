"use client";

import { parseTopo, topoCode, topoSteps } from "@/visualizer/algorithms/topo-sort";
import { circleLayout } from "@/visualizer/core/layout";
import type { Tone } from "@/visualizer/core/types";
import { GraphView, QueueView, TimelineView } from "../primitives";
import { useL } from "../useL";
import { Visualizer } from "../Visualizer";

export function TopoSortViz() {
  const l = useL();
  return (
    <Visualizer
      title={{ en: "Topological sort (Kahn's algorithm)", uz: "Topological sort (Kahn algoritmi)" }}
      code={topoCode}
      defaultInput="shirt>tie, tie>jacket, pants>shoes, pants>belt, belt>jacket, socks>shoes"
      parse={parseTopo}
      generate={topoSteps}
      inputLabel={{ en: "Directed edges A>B (\"A before B\")", uz: "Yoʻnalgan edge'lar A>B (\"A B dan oldin\")" }}
      presets={[
        { label: l("getting dressed", "kiyinish"), input: "shirt>tie, tie>jacket, pants>shoes, pants>belt, belt>jacket, socks>shoes" },
        { label: l("courses", "kurslar"), input: "A>B, A>C, B>D, C>D, D>E" },
        { label: l("cycle", "cycle"), input: "A>B, B>C, C>A, C>D" },
      ]}
      render={(s) => {
        const pos = circleLayout(s.nodes);
        const tone = (n: string): Tone => {
          if (s.cycle?.includes(n)) return "danger";
          if (n === s.current) return "active";
          if (s.order.includes(n)) return "visited";
          if (s.queue.includes(n)) return "compare";
          return "default";
        };
        return (
          <div className="flex flex-col gap-4">
            <GraphView
              directed
              nodes={s.nodes.map((n) => ({ id: n, ...pos[n], tone: tone(n), badge: `in=${s.indeg[n]}` }))}
              edges={s.edges.map((e) => ({ from: e.from, to: e.to, tone: s.removed.includes(`${e.from}>${e.to}`) ? "muted" : undefined, dashed: s.removed.includes(`${e.from}>${e.to}`) }))}
            />
            <div className="flex flex-wrap gap-6">
              <QueueView label={l("ready (in-degree 0)", "tayyor (in-degree 0)")} items={s.queue.map((n) => ({ id: n, label: n }))} />
              <TimelineView label={l("order", "tartib")} entries={s.order} />
            </div>
          </div>
        );
      }}
    />
  );
}
