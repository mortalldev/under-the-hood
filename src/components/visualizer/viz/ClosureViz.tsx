"use client";

import { motion } from "motion/react";
import { closureCode, closureSteps } from "@/visualizer/algorithms/closure";
import { ok } from "@/visualizer/core/types";
import { CallStackView } from "../primitives";
import { useL } from "../useL";
import { Visualizer } from "../Visualizer";

const parseNothing = () => ok(null);
const generate = () => closureSteps();

export function ClosureViz() {
  const l = useL();
  return (
    <Visualizer
      title={{ en: "Closures: environment records and the [[Environment]] slot", uz: "Closure'lar: environment record'lar va [[Environment]] sloti" }}
      code={closureCode}
      defaultInput=""
      parse={parseNothing}
      generate={generate}
      hideInput
      render={(s) => (
        <div className="flex flex-wrap items-start gap-6">
          <div className="flex min-w-64 flex-1 flex-col gap-2">
            <p className="text-xs font-medium text-fg-muted">{l("Environment records (heap)", "Environment record'lar (heap)")}</p>
            {s.envs.map((e) => (
              <motion.div
                layout
                key={e.id}
                className={`rounded-lg border p-2 text-xs ${!e.reachable ? "border-dashed border-rose-500/60 opacity-50" : s.active === e.id ? "border-accent bg-accent/10" : "border-border bg-bg"}`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold">{e.label}</span>
                  <span className="font-mono text-fg-muted">outer → {e.outer ? s.envs.find((x) => x.id === e.outer)?.label ?? e.outer : "null"}</span>
                </div>
                {e.vars.length > 0 && (
                  <ul className="mt-1 flex flex-wrap gap-1 font-mono">
                    {e.vars.map(([k, v]) => (
                      <li key={k} className="rounded border border-border bg-surface-1 px-1.5 py-0.5">
                        {k}: <span className={v === "<TDZ>" ? "text-rose-600 dark:text-rose-400" : "text-accent"}>{v}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </motion.div>
            ))}
          </div>
          <div className="flex min-w-48 flex-col gap-2">
            <p className="text-xs font-medium text-fg-muted">{l("Function objects", "Function object'lar")}</p>
            {s.fns.map((f) => (
              <motion.div layout key={f.id} className="rounded-lg border border-border bg-bg p-2 font-mono text-xs">
                <span className="font-semibold">ƒ {f.label}</span>
                <div className="text-fg-muted">[[Environment]] → {s.envs.find((e) => e.id === f.env)?.label ?? f.env}</div>
              </motion.div>
            ))}
            <CallStackView label="Call stack" frames={s.stack.map((f, i) => ({ id: `${i}-${f}`, title: f }))} />
          </div>
        </div>
      )}
    />
  );
}
