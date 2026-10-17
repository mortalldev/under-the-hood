"use client";

import { consistentHashingCode, consistentHashingSteps, parseConsistentHashing } from "@/visualizer/algorithms/consistent-hashing";
import { Stats } from "../primitives";
import { useL } from "../useL";
import { Visualizer } from "../Visualizer";

const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ec4899", "#0ea5e9", "#a855f7"];

export function ConsistentHashingViz() {
  const l = useL();
  return (
    <Visualizer
      title={{ en: "Consistent hashing — adding a node moves few keys", uz: "Consistent hashing — node qoʻshish kam key'ni koʻchiradi" }}
      code={consistentHashingCode}
      defaultInput="A, B, C; user1, user2, user3, user4, user5, user6, user7, user8, user9, user10; D"
      parse={parseConsistentHashing}
      generate={consistentHashingSteps}
      inputLabel={{ en: "nodes; keys; node to add", uz: "node'lar; key'lar; qoʻshiladigan node" }}
      render={(s) => {
        const nodeNames = [...new Set(s.ring.map((p) => p.node))];
        const color = (n: string | null) => (n ? COLORS[nodeNames.indexOf(n) % COLORS.length] : "currentColor");
        const at = (deg: number, r: number) => {
          const a = ((deg - 90) * Math.PI) / 180;
          return { x: 50 + r * Math.cos(a), y: 50 + r * Math.sin(a) };
        };
        return (
          <div className="flex flex-wrap items-center gap-6">
            <svg viewBox="0 0 100 100" className="w-64 max-w-full" role="img" aria-label={l("hash ring", "hash halqasi")}>
              <circle cx="50" cy="50" r="36" fill="none" className="stroke-border" strokeWidth="1" />
              {s.keys.map((k) => {
                const p = at(k.pos, 36);
                return (
                  <g key={k.key}>
                    <circle cx={p.x} cy={p.y} r={k.key === s.current ? 2.2 : 1.6} fill={color(k.owner)} stroke={k.moved ? "#ef4444" : "none"} strokeWidth="0.8" />
                  </g>
                );
              })}
              {s.ring.map((p) => {
                const q = at(p.pos, 36);
                const t = at(p.pos, 45);
                return (
                  <g key={p.node}>
                    <rect x={q.x - 2.6} y={q.y - 2.6} width="5.2" height="5.2" rx="1" fill={color(p.node)} className={p.node === s.added ? "stroke-fg" : ""} strokeWidth="0.6" />
                    <text x={t.x} y={t.y + 1.2} textAnchor="middle" className="fill-fg font-mono text-[4px] font-semibold">
                      {p.node}
                    </text>
                  </g>
                );
              })}
            </svg>
            <div className="flex flex-col gap-2">
              <ul className="grid grid-cols-2 gap-x-4 gap-y-1 font-mono text-xs">
                {s.keys.map((k) => (
                  <li key={k.key} className={k.moved ? "font-semibold text-rose-600 dark:text-rose-400" : ""}>
                    <span className="mr-1 inline-block size-2 rounded-full" style={{ background: color(k.owner) }} />
                    {k.key} → {k.owner ?? "?"}
                    {k.moved && " ↻"}
                  </li>
                ))}
              </ul>
              {s.moduloMoved !== null && (
                <Stats
                  items={[
                    [l("moved (ring)", "koʻchdi (halqa)"), s.keys.filter((k) => k.moved).length],
                    [l("would move (hash % N)", "koʻchardi (hash % N)"), s.moduloMoved],
                  ]}
                />
              )}
            </div>
          </div>
        );
      }}
    />
  );
}
