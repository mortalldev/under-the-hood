"use client";

import { mergeIntervalsCode, mergeIntervalsSteps, parseIntervals } from "@/visualizer/algorithms/intervals";
import { useL } from "../useL";
import { Visualizer } from "../Visualizer";

export function IntervalsViz() {
  const l = useL();
  return (
    <Visualizer
      title={{ en: "Merge overlapping intervals", uz: "Kesishuvchi interval'larni birlashtirish" }}
      code={mergeIntervalsCode}
      defaultInput="8-10, 1-3, 2-6, 15-18, 17-20, 4-5"
      parse={parseIntervals}
      generate={mergeIntervalsSteps}
      inputLabel={{ en: "Intervals start-end (0–99)", uz: "Interval'lar start-end (0–99)" }}
      presets={[
        { label: l("classic", "klassik"), input: "8-10, 1-3, 2-6, 15-18, 17-20, 4-5" },
        { label: l("contained", "ichma-ich"), input: "1-10, 2-3, 4-5" },
        { label: l("touching", "tegib turuvchi"), input: "1-2, 2-3, 5-6" },
      ]}
      render={(s) => {
        const max = Math.max(s.max, 1);
        const pct = (x: number) => `${(x / (max + 1)) * 100}%`;
        const bar = (a: number, b: number) => ({ left: pct(a), width: `max(6px, ${pct(b - a)})` });
        return (
          <div className="flex min-w-72 flex-col gap-1.5">
            <p className="text-xs font-medium text-fg-muted">{l("sorted input", "saralangan input")}</p>
            {s.sorted.map(([a, b], i) => (
              <div key={i} className="relative h-5">
                <div
                  className={`absolute top-0 flex h-5 items-center rounded px-1 font-mono text-[0.65rem] transition-colors ${
                    s.i === i ? (s.overlap ? "bg-amber-500/40" : "bg-accent/40") : s.i !== null && i < s.i ? "bg-fg/10" : "bg-fg/20"
                  }`}
                  style={bar(a, b)}
                >
                  {a}–{b}
                </div>
              </div>
            ))}
            <p className="mt-3 text-xs font-medium text-fg-muted">{l("merged", "birlashtirilgan")}</p>
            <div className="relative h-6 rounded bg-surface-2">
              {s.out.map(([a, b], i) => (
                <div key={i} className="absolute top-0 flex h-6 items-center rounded bg-emerald-500/40 px-1 font-mono text-[0.65rem]" style={bar(a, b)}>
                  {a}–{b}
                </div>
              ))}
            </div>
          </div>
        );
      }}
    />
  );
}
