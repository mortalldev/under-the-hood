"use client";

import { useId, useState } from "react";
import { useL } from "@/components/visualizer/useL";

const CURVES = [
  { name: "O(1)", f: () => 1, color: "#10b981" },
  { name: "O(log n)", f: (n: number) => Math.max(1, Math.log2(n)), color: "#0ea5e9" },
  { name: "O(n)", f: (n: number) => n, color: "#6366f1" },
  { name: "O(n log n)", f: (n: number) => n * Math.max(1, Math.log2(n)), color: "#a855f7" },
  { name: "O(n²)", f: (n: number) => n * n, color: "#f59e0b" },
  { name: "O(2ⁿ)", f: (n: number) => 2 ** n, color: "#ef4444" },
] as const;

const fmt = (x: number) => (x >= 1e15 ? x.toExponential(1) : x >= 1e6 ? `${(x / 1e6).toFixed(x >= 1e9 ? 0 : 1)}M` : Math.round(x).toLocaleString("en-US"));

/** Operation counts and wall-clock estimate at ~10^8 simple operations per second. */
export function ComplexityChart() {
  const l = useL();
  const id = useId();
  const [exp, setExp] = useState(4);
  const n = Math.round(10 ** exp);
  const max = Math.log10(CURVES[4].f(1e6));

  return (
    <figure className="not-prose my-8 rounded-xl border border-border bg-surface-1 p-4">
      <label htmlFor={id} className="flex flex-wrap items-center gap-3 text-sm font-medium">
        n = <span className="font-mono">{n.toLocaleString("en-US")}</span>
        <input id={id} type="range" min={0.5} max={6} step={0.25} value={exp} onChange={(e) => setExp(Number(e.target.value))} className="h-8 min-w-40 flex-1 cursor-pointer accent-[var(--accent)]" />
      </label>
      <ul className="mt-4 space-y-2">
        {CURVES.map((c) => {
          const ops = c.f(n);
          const width = Math.min(100, (Math.log10(Math.max(ops, 1)) / max) * 100);
          const seconds = ops / 1e8;
          return (
            <li key={c.name} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-2 gap-y-1 text-xs sm:grid-cols-[6.5rem_minmax(0,1fr)_9rem]">
              <span className="font-mono font-semibold">{c.name}</span>
              <span className="order-last col-span-2 h-3 rounded bg-surface-2 sm:order-none sm:col-span-1">
                <span className="block h-full rounded transition-all duration-300" style={{ width: `${Math.max(width, 1)}%`, background: c.color }} />
              </span>
              <span className="text-right font-mono text-fg-muted">
                {fmt(ops)} · {seconds < 1e-3 ? "<1 ms" : seconds < 1 ? `${Math.round(seconds * 1000)} ms` : seconds < 3600 ? `${seconds.toFixed(1)} s` : "∞"}
              </span>
            </li>
          );
        })}
      </ul>
      <figcaption className="mt-3 text-xs text-fg-muted">
        {l(
          "Bars use a logarithmic scale. Times assume ~10⁸ simple operations per second — a rough rule of thumb for judging whether an approach fits typical judge limits, not a benchmark.",
          "Ustunlar logarifmik shkalada. Vaqtlar soniyasiga ~10⁸ oddiy amal deb olingan — bu yondashuv odatiy judge limitlariga sigʻishini baholash uchun taxminiy qoida, benchmark emas.",
        )}
      </figcaption>
    </figure>
  );
}
