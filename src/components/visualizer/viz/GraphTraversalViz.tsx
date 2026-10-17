"use client";

import { useCallback } from "react";
import { bfsCode, bfsSteps, dfsCode, dfsSteps, parseGraphInput, type GraphInput } from "@/visualizer/algorithms/graph-traversal";
import { circleLayout } from "@/visualizer/core/layout";
import type { Tone } from "@/visualizer/core/types";
import { CallStackView, GraphView, QueueView, TimelineView } from "../primitives";
import { useL } from "../useL";
import { Visualizer } from "../Visualizer";

export function GraphTraversalViz({ mode = "bfs" }: { mode?: "bfs" | "dfs" }) {
  const l = useL();
  const generate = useCallback((g: GraphInput) => (mode === "bfs" ? bfsSteps(g) : dfsSteps(g)), [mode]);
  return (
    <Visualizer
      title={mode === "bfs" ? { en: "BFS — level by level, shortest hop counts", uz: "BFS — daraja-daraja, eng qisqa qadamlar soni" } : { en: "DFS — go deep first, backtrack on return", uz: "DFS — avval chuqurga, qaytishda orqaga" }}
      code={mode === "bfs" ? bfsCode : dfsCode}
      defaultInput="A-B, A-C, B-D, C-D, C-E, D-F, E-F; A"
      parse={parseGraphInput}
      generate={generate}
      inputLabel={{ en: "Undirected edges; start", uz: "Yoʻnalishsiz edge'lar; start" }}
      presets={[
        { label: l("diamond", "romb"), input: "A-B, A-C, B-D, C-D, C-E, D-F, E-F; A" },
        { label: l("two components", "ikki component"), input: "A-B, B-C, D-E; A" },
        { label: l("long path", "uzun yoʻl"), input: "A-B, B-C, C-D, D-E, A-E; A" },
      ]}
      render={(s) => {
        const pos = circleLayout(s.nodes);
        const tone = (n: string): Tone => {
          if (n === s.current) return "active";
          if (s.finished.includes(n)) return "visited";
          if (s.frontier.includes(n)) return "compare";
          if (s.discovered.includes(n)) return "window";
          return "default";
        };
        const isTree = (a: string, b: string) => s.treeEdges.some(([x, y]) => (x === a && y === b) || (x === b && y === a));
        const isActive = (a: string, b: string) => s.activeEdge !== null && ((s.activeEdge[0] === a && s.activeEdge[1] === b) || (s.activeEdge[0] === b && s.activeEdge[1] === a));
        return (
          <div className="flex flex-col gap-4">
            <GraphView
              nodes={s.nodes.map((n) => ({ id: n, ...pos[n], tone: tone(n), badge: mode === "bfs" && n in s.dist ? `d=${s.dist[n]}` : undefined }))}
              edges={s.edges.map((e) => ({ from: e.from, to: e.to, tone: isActive(e.from, e.to) ? "compare" : isTree(e.from, e.to) ? "match" : undefined }))}
            />
            <div className="flex flex-wrap items-start gap-6">
              {mode === "bfs" ? (
                <QueueView label="queue" items={s.frontier.map((n) => ({ id: n, label: n }))} />
              ) : (
                <CallStackView label="call stack" frames={s.frontier.map((n) => ({ id: n, title: `dfs(${n})` }))} />
              )}
              <TimelineView label={l("visit order", "tashrif tartibi")} entries={s.order} />
            </div>
          </div>
        );
      }}
    />
  );
}
