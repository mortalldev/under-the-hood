"use client";

import { markSweepCode, markSweepSteps, parseMarkSweep } from "@/visualizer/algorithms/mark-sweep";
import { circleLayout } from "@/visualizer/core/layout";
import type { Tone } from "@/visualizer/core/types";
import { GraphView, StackView, Stats } from "../primitives";
import { useL } from "../useL";
import { Visualizer } from "../Visualizer";

export function MarkSweepViz() {
  const l = useL();
  return (
    <Visualizer
      title={{ en: "Tracing GC: mark from roots, sweep the rest", uz: "Tracing GC: root'lardan belgilash, qolganini tozalash" }}
      code={markSweepCode}
      defaultInput="window, stack; window>app, app>cache, cache>user, stack>tmp, old>orphan, orphan>old"
      parse={parseMarkSweep}
      generate={markSweepSteps}
      inputLabel={{ en: "roots; references A>B (\"A holds a reference to B\")", uz: "root'lar; reference'lar A>B (\"A B ga reference saqlaydi\")" }}
      render={(s) => {
        const pos = circleLayout(s.nodes);
        const tone = (n: string): Tone => {
          if (s.freed.includes(n)) return "danger";
          if (n === s.current) return "active";
          if (s.marked.includes(n)) return s.phase === "done" ? "found" : "visited";
          return s.phase === "sweep" ? "compare" : "default";
        };
        return (
          <div className="flex flex-wrap items-start gap-6">
            <div className="min-w-72 flex-1">
              <GraphView directed nodes={s.nodes.map((n) => ({ id: n, ...pos[n], tone: tone(n), badge: s.roots.includes(n) ? "root" : undefined }))} edges={s.edges.map((e) => ({ from: e.from, to: e.to, dashed: s.freed.includes(e.from) }))} />
            </div>
            <div className="flex flex-col gap-3">
              <StackView label={l("worklist", "worklist")} items={s.work.map((n) => ({ id: n, label: n }))} />
              <Stats items={[["phase", s.phase], [l("marked", "belgilangan"), s.marked.length], [l("freed", "ozod"), s.freed.length]]} />
            </div>
          </div>
        );
      }}
    />
  );
}
