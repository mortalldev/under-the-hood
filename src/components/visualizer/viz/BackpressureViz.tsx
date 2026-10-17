"use client";

import { backpressureCode, backpressureSteps, parseBackpressure } from "@/visualizer/algorithms/backpressure";
import { Stats } from "../primitives";
import { useL } from "../useL";
import { Visualizer } from "../Visualizer";

export function BackpressureViz() {
  const l = useL();
  return (
    <Visualizer
      title={{ en: "Streams: what write() returning false is for", uz: "Streams: write() false qaytarishi nima uchun kerak" }}
      code={backpressureCode}
      defaultInput="4, 2, 6, 30, yes"
      parse={parseBackpressure}
      generate={backpressureSteps}
      inputLabel={{ en: "produce/tick, consume/tick, highWaterMark, total chunks, respect backpressure (yes|no)", uz: "produce/tick, consume/tick, highWaterMark, jami chunk, backpressure hisobga olinsinmi (yes|no)" }}
      presets={[
        { label: l("respects it", "hisobga oladi"), input: "4, 2, 6, 30, yes" },
        { label: l("ignores it", "e'tiborsiz"), input: "4, 2, 6, 30, no" },
        { label: l("fast consumer", "tez consumer"), input: "2, 4, 6, 20, yes" },
      ]}
      render={(s) => {
        const scale = Math.max(s.maxBuffered, s.highWaterMark * 2, 8);
        const w = 100;
        const h = 30;
        const pts = s.history.map((b, i) => `${(i / Math.max(s.history.length - 1, 1)) * w},${h - (b / scale) * h}`).join(" ");
        return (
          <div className="flex flex-col gap-4">
            <div>
              <p className="mb-1.5 text-xs font-medium text-fg-muted">{l("writable buffer", "writable buffer")}</p>
              <div className="relative h-8 w-full max-w-xl rounded-md border border-border bg-bg">
                <div
                  className={`h-full rounded-md transition-all duration-300 ${s.buffered >= s.highWaterMark ? "bg-rose-500/40" : "bg-accent/40"}`}
                  style={{ width: `${Math.min(100, (s.buffered / scale) * 100)}%` }}
                />
                <div className="absolute inset-y-0 border-l-2 border-dashed border-amber-500" style={{ left: `${(s.highWaterMark / scale) * 100}%` }} aria-hidden="true" />
                <span className="absolute -top-0.5 text-[0.6rem] font-semibold text-amber-600 dark:text-amber-400" style={{ left: `calc(${(s.highWaterMark / scale) * 100}% + 4px)` }}>
                  highWaterMark
                </span>
              </div>
            </div>
            <svg viewBox={`0 0 ${w} ${h}`} className="h-24 w-full max-w-xl overflow-visible" role="img" aria-label={l("buffer size over time", "vaqt boʻyicha buffer hajmi")}>
              <line x1="0" x2={w} y1={h - (s.highWaterMark / scale) * h} y2={h - (s.highWaterMark / scale) * h} className="stroke-amber-500" strokeDasharray="2 1.5" strokeWidth="0.4" />
              <polyline points={pts} fill="none" className="stroke-accent" strokeWidth="0.8" />
            </svg>
            <Stats
              items={[
                ["tick", s.tick],
                ["buffered", s.buffered],
                [l("peak", "eng koʻp"), s.maxBuffered],
                [l("delivered", "yetkazildi"), `${s.consumed}/${s.total}`],
                ["producer", s.paused ? l("paused", "toʻxtagan") : l("writing", "yozmoqda")],
                ...(s.drained ? [["event", "'drain'"] as [string, string]] : []),
              ]}
            />
          </div>
        );
      }}
    />
  );
}
