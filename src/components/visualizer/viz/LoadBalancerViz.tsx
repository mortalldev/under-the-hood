"use client";

import { useCallback } from "react";
import { loadBalancerCode, loadBalancerSteps, parseLb, type LbInput, type LbPolicy } from "@/visualizer/algorithms/load-balancer";
import { Stats } from "../primitives";
import { useL } from "../useL";
import { Visualizer } from "../Visualizer";

export function LoadBalancerViz({ policy = "round-robin" }: { policy?: LbPolicy }) {
  const l = useL();
  const generate = useCallback((input: LbInput) => loadBalancerSteps(input, policy), [policy]);
  return (
    <Visualizer
      title={{ en: `Load balancing: ${policy}`, uz: `Load balancing: ${policy}` }}
      code={loadBalancerCode}
      defaultInput="2; 6, 1, 6, 1, 6, 1, 6, 1"
      parse={parseLb}
      generate={generate}
      inputLabel={{ en: "servers; request durations (one request per tick)", uz: "server'lar; request davomiyliklari (har tick'da bitta request)" }}
      render={(s) => (
        <div className="flex flex-col gap-4">
          <div className="grid max-w-xl gap-2" style={{ gridTemplateColumns: `repeat(${s.load.length}, minmax(0, 1fr))` }}>
            {s.load.map((reqs, i) => (
              <div key={i} className={`rounded-lg border p-2 text-xs ${s.assigned === i ? "border-accent bg-accent/10" : "border-border"}`}>
                <p className="font-medium">server {i + 1}</p>
                <div className="mt-1 flex min-h-6 flex-wrap gap-1">
                  {reqs.map((r, k) => (
                    <span key={k} className={`rounded px-1.5 font-mono ${r > 3 ? "bg-rose-500/25" : "bg-emerald-500/25"}`}>
                      {r}
                    </span>
                  ))}
                </div>
                <p className="mt-1 text-fg-muted">
                  {l("active", "faol")}: {reqs.length}
                </p>
              </div>
            ))}
          </div>
          <Stats items={[["t", s.time], [l("peak per server", "server boʻyicha eng koʻp"), s.maxActive.join(" / ")]]} />
        </div>
      )}
    />
  );
}
