"use client";

import { useTranslations } from "next-intl";
import { useCallback, useState } from "react";
import { browserPresets, eventLoopSteps, nodePresets, parseEventLoop, type Program, type Runtime } from "@/visualizer/algorithms/event-loop";
import { CallStackView, QueueView, TimelineView } from "../primitives";
import { useL } from "../useL";
import { Visualizer } from "../Visualizer";

const NODE_PHASES = ["timers", "pending", "poll", "check", "close"] as const;

export function EventLoopViz({ runtime = "browser", preset = 0 }: { runtime?: Runtime; preset?: number }) {
  const l = useL();
  const parse = useCallback((raw: string) => parseEventLoop(raw, runtime), [runtime]);
  const presets = runtime === "node" ? nodePresets : browserPresets;
  return (
    <Visualizer
      title={runtime === "node" ? { en: "Node.js event loop simulator", uz: "Node.js event loop simulyatori" } : { en: "Browser event loop simulator", uz: "Brauzer event loop simulyatori" }}
      code={(p: Program) => p.code}
      defaultInput={presets[Math.min(preset, presets.length - 1)].input}
      parse={parse}
      generate={eventLoopSteps}
      multiline
      inputLabel={{ en: "Your code (edit it, then Run)", uz: "Kodingiz (tahrirlang, keyin Ishga tushiring)" }}
      inputHint={
        runtime === "node"
          ? { en: "Supports console.log, setTimeout, setImmediate, process.nextTick, queueMicrotask, Promise.resolve().then, new Promise, async/await, fs.readFile(path, cb).", uz: "console.log, setTimeout, setImmediate, process.nextTick, queueMicrotask, Promise.resolve().then, new Promise, async/await, fs.readFile(path, cb) qoʻllab-quvvatlanadi." }
          : { en: "Supports console.log, setTimeout, queueMicrotask, Promise.resolve().then, new Promise((resolve) => …), async/await, function calls.", uz: "console.log, setTimeout, queueMicrotask, Promise.resolve().then, new Promise((resolve) => …), async/await, funksiya chaqiruvlari qoʻllab-quvvatlanadi." }
      }
      presets={presets}
      footer={({ input, steps, atEnd }) => (
        <PredictBox key={input.code} actual={steps[steps.length - 1].state.console} revealed={atEnd} />
      )}
      render={(s) => (
        <div className="flex flex-col gap-4">
          {runtime === "node" && (
            <ol className="flex flex-wrap gap-1 text-xs" aria-label={l("event loop phases", "event loop phase'lari")}>
              {NODE_PHASES.map((p) => (
                <li key={p} className={`rounded-full border px-2.5 py-1 font-mono ${s.phase === p ? "border-accent bg-accent/20 font-semibold" : "border-border text-fg-muted"}`}>
                  {p}
                </li>
              ))}
            </ol>
          )}
          {runtime === "browser" && (
            <p className={`text-xs ${s.phase === "render" ? "font-semibold text-accent" : "text-fg-subtle"}`}>
              {l("render opportunity", "render imkoniyati")} {s.phase === "render" ? "●" : "○"}
            </p>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <CallStackView label="Call stack" frames={s.stack.map((f) => ({ id: f.id, title: f.label }))} />
            <QueueView label={runtime === "node" ? l("Timers (libuv) / pending I/O", "Timer'lar (libuv) / kutilayotgan I/O") : "Web APIs (timers)"} items={s.webApis} />
            {runtime === "browser" ? (
              <QueueView label={l("Task queue", "Task queue")} items={s.tasks} />
            ) : (
              <QueueView label="process.nextTick queue" items={s.ticks.map((t) => ({ ...t, tone: "danger" as const }))} />
            )}
            <QueueView label={l("Microtask queue (promises)", "Microtask queue (promise'lar)")} items={s.microtasks.map((t) => ({ ...t, tone: "compare" as const }))} />
            {runtime === "node" && <QueueView label={l("check queue (setImmediate)", "check queue (setImmediate)")} items={s.immediates} />}
            {runtime === "node" && <QueueView label={l("poll queue (I/O callbacks)", "poll queue (I/O callback'lar)")} items={s.io} />}
          </div>
          <TimelineView label="Console" entries={s.console} />
        </div>
      )}
    />
  );
}

function PredictBox({ actual, revealed }: { actual: string[]; revealed: boolean }) {
  const t = useTranslations("Visualizer");
  const [guess, setGuess] = useState("");
  const [checked, setChecked] = useState(false);
  const tokens = guess.split(/[\s,]+/).filter(Boolean);
  const correct = tokens.join(" ") === actual.join(" ");
  const show = checked && revealed;

  return (
    <div className="mt-3 rounded-lg border border-dashed border-border p-3">
      <form
        className="flex flex-col gap-2 sm:flex-row sm:items-end"
        onSubmit={(e) => {
          e.preventDefault();
          setChecked(true);
        }}
      >
        <label className="flex flex-1 flex-col gap-1 text-xs font-medium text-fg-muted">
          {t("predictLabel")}
          <input
            value={guess}
            onChange={(e) => {
              setGuess(e.target.value);
              setChecked(false);
            }}
            className="rounded-md border border-border bg-bg px-3 py-2 font-mono text-sm text-fg outline-none focus:border-accent"
            placeholder="A D C B"
          />
        </label>
        <button type="submit" className="rounded-md border border-border px-4 py-2 text-sm font-semibold hover:bg-surface-2">
          {t("predictCheck")}
        </button>
      </form>
      <p className="mt-2 text-sm" aria-live="polite">
        {checked && !revealed && <span className="text-fg-muted">{t("predictPending")}</span>}
        {show && correct && <span className="font-medium text-emerald-600 dark:text-emerald-400">{t("predictCorrect")}</span>}
        {show && !correct && <span className="text-amber-700 dark:text-amber-400">{t("predictWrong", { actual: actual.join(" ") })}</span>}
      </p>
    </div>
  );
}
