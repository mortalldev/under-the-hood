"use client";

import { hooksCode, hooksSteps, parseHooks } from "@/visualizer/algorithms/hooks-list";
import { useL } from "../useL";
import { Visualizer } from "../Visualizer";

export function HooksViz() {
  const l = useL();
  return (
    <Visualizer
      title={{ en: "Hooks are a list indexed by call order", uz: "Hook'lar — chaqiruv tartibi boʻyicha indekslangan roʻyxat" }}
      code={hooksCode}
      defaultInput="useState, useEffect, useRef; useState, useRef"
      parse={parseHooks}
      generate={hooksSteps}
      inputLabel={{ en: "hooks in render 1; hooks in render 2", uz: "1-render'dagi hook'lar; 2-render'dagi hook'lar" }}
      presets={[
        { label: l("conditional hook", "shartli hook"), input: "useState, useEffect, useRef; useState, useRef" },
        { label: l("stable", "barqaror"), input: "useState, useEffect, useRef; useState, useEffect, useRef" },
        { label: l("early return", "erta return"), input: "useState, useMemo, useEffect; useState" },
      ]}
      render={(s) => (
        <div className="flex flex-col gap-4">
          <div>
            <p className="mb-1.5 text-xs font-medium text-fg-muted">fiber.memoizedState</p>
            <ol className="flex flex-wrap items-center gap-1 font-mono text-xs">
              {s.list.map((h, i) => (
                <li key={i} className="flex items-center gap-1">
                  <div
                    className={`rounded-md border p-2 ${s.mismatchAt === i ? "border-rose-500 bg-rose-500/15" : s.cursor === i ? "border-accent bg-accent/15" : "border-border bg-bg"}`}
                  >
                    <div className="text-fg-subtle">#{i}</div>
                    <div className="font-semibold">{h.type}</div>
                    <div className="text-fg-muted">{h.value}</div>
                  </div>
                  <span aria-hidden="true" className="text-fg-subtle">→</span>
                </li>
              ))}
              <li className="text-fg-subtle">null</li>
            </ol>
          </div>
          <div>
            <p className="mb-1.5 text-xs font-medium text-fg-muted">
              {l("render", "render")} #{s.render} {l("calls", "chaqiruvlar")}
            </p>
            <ol className="flex flex-wrap gap-1 font-mono text-xs">
              {s.calls.map((c, i) => (
                <li key={i} className="rounded border border-border bg-bg px-2 py-1">
                  {c}()
                </li>
              ))}
            </ol>
          </div>
          {s.error && <p className="rounded-md border border-rose-500/50 bg-rose-500/10 p-2 text-sm text-rose-700 dark:text-rose-300">{s.error}</p>}
        </div>
      )}
    />
  );
}
