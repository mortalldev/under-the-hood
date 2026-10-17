"use client";

import { parseThreadPool, threadPoolCode, threadPoolSteps } from "@/visualizer/algorithms/thread-pool";
import { QueueView, Stats, TimelineView } from "../primitives";
import { useL } from "../useL";
import { Visualizer } from "../Visualizer";

export function ThreadPoolViz() {
  const l = useL();
  return (
    <Visualizer
      title={{ en: "libuv thread pool: 6 tasks, 4 threads", uz: "libuv thread pool: 6 ta task, 4 ta thread" }}
      code={threadPoolCode}
      defaultInput="4; 3, 3, 3, 3, 3, 3"
      parse={parseThreadPool}
      generate={threadPoolSteps}
      inputLabel={{ en: "pool size; task durations", uz: "pool hajmi; task davomiyliklari" }}
      presets={[
        { label: "size 4", input: "4; 3, 3, 3, 3, 3, 3" },
        { label: "size 8", input: "8; 3, 3, 3, 3, 3, 3" },
        { label: l("one slow task", "bitta sekin task"), input: "2; 9, 1, 1, 1, 1" },
      ]}
      render={(s) => (
        <div className="flex flex-col gap-4">
          <div className="grid max-w-xl grid-cols-2 gap-2 sm:grid-cols-4">
            {s.threads.map((t, i) => (
              <div key={i} className={`rounded-lg border p-2 text-xs ${t ? "border-accent bg-accent/10" : "border-dashed border-border"}`}>
                <p className="font-medium text-fg-muted">thread {i + 1}</p>
                {t ? (
                  <>
                    <p className="font-mono font-semibold">task {t.task}</p>
                    <div className="mt-1 h-1.5 rounded bg-surface-2">
                      <div className="h-full rounded bg-accent transition-all duration-300" style={{ width: `${(1 - t.left / s.durations[t.task - 1]) * 100}%` }} />
                    </div>
                  </>
                ) : (
                  <p className="text-fg-subtle">idle</p>
                )}
              </div>
            ))}
          </div>
          <QueueView label={l("waiting in libuv's queue", "libuv navbatida kutmoqda")} items={s.queue.map((t) => ({ id: t, label: `task ${t}` }))} />
          <TimelineView label={l("completed (task@time)", "tugagan (task@vaqt)")} entries={s.done.map((d) => `${d.task}@${d.at}`)} />
          <Stats items={[["t", s.time]]} />
        </div>
      )}
    />
  );
}
