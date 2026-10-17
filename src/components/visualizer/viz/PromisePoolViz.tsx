"use client";

import { parsePromisePool, promisePoolCode, promisePoolSteps } from "@/visualizer/algorithms/promise-pool";
import { QueueView, Stats, TimelineView } from "../primitives";
import { useL } from "../useL";
import { Visualizer } from "../Visualizer";

export function PromisePoolViz() {
  const l = useL();
  return (
    <Visualizer
      title={{ en: "Promise pool: limit concurrent async work", uz: "Promise pool: parallel async ishni cheklash" }}
      code={promisePoolCode}
      defaultInput="2; 4, 1, 3!, 2, 2"
      parse={parsePromisePool}
      generate={promisePoolSteps}
      inputLabel={{ en: "limit; task durations (add ! to make a task reject)", uz: "limit; task davomiyliklari (task reject boʻlishi uchun ! qoʻshing)" }}
      presets={[
        { label: "limit 2", input: "2; 4, 1, 3!, 2, 2" },
        { label: l("limit 1 = sequential", "limit 1 = ketma-ket"), input: "1; 4, 1, 3, 2, 2" },
        { label: l("limit 5 = Promise.all", "limit 5 = Promise.all"), input: "5; 4, 1, 3, 2, 2" },
      ]}
      render={(s) => (
        <div className="flex flex-col gap-4">
          <div className="grid max-w-xl grid-cols-2 gap-2 sm:grid-cols-4">
            {s.slots.map((t, i) => (
              <div key={i} className={`rounded-lg border p-2 text-xs ${t ? "border-accent bg-accent/10" : "border-dashed border-border"}`}>
                <p className="font-medium text-fg-muted">worker {i + 1}</p>
                {t ? (
                  <>
                    <p className="font-mono font-semibold">task {t.task}</p>
                    <div className="mt-1 h-1.5 rounded bg-surface-2">
                      <div className="h-full rounded bg-accent transition-all duration-300" style={{ width: `${(1 - t.left / s.tasks[t.task - 1].duration) * 100}%` }} />
                    </div>
                  </>
                ) : (
                  <p className="text-fg-subtle">{l("idle", "boʻsh")}</p>
                )}
              </div>
            ))}
          </div>
          <QueueView label={l("not started yet", "hali boshlanmagan")} items={s.queue.map((t) => ({ id: t, label: `task ${t}` }))} />
          <TimelineView label={l("settled (task@time)", "yakunlangan (task@vaqt)")} entries={s.done.map((d) => `${d.task}@${d.at}${d.ok ? "" : " ✗"}`)} />
          <ol className="flex flex-wrap gap-1 font-mono text-xs" aria-label={l("results in input order", "natijalar input tartibida")}>
            {s.results.map((r, i) => (
              <li
                key={i}
                className={`rounded border px-2 py-1 ${r === "ok" ? "border-emerald-500 bg-emerald-500/15" : r === "err" ? "border-rose-500 bg-rose-500/15" : "border-dashed border-border text-fg-subtle"}`}
              >
                [{i}] {r === "ok" ? "fulfilled" : r === "err" ? "rejected" : "pending"}
              </li>
            ))}
          </ol>
          <Stats items={[["t", s.time], [l("max in flight", "maks. bir vaqtda"), s.maxInFlight]]} />
        </div>
      )}
    />
  );
}
