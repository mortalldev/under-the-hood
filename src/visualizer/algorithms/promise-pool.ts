import { parseInteger, splitParts } from "../core/parse";
import { recorder } from "../core/recorder";
import { fail, ok, type ParseResult } from "../core/types";

export const promisePoolCode = `async function pool(tasks, limit) {
  const results = new Array(tasks.length);
  let next = 0;                                   // shared cursor: safe, JS is single-threaded
  async function worker() {
    while (next < tasks.length) {
      const i = next++;                           // claim a task synchronously
      try { results[i] = { status: "fulfilled", value: await tasks[i]() }; }
      catch (e) { results[i] = { status: "rejected", reason: e }; }
    }
  }
  const workers = Array.from({ length: Math.min(limit, tasks.length) }, worker);
  await Promise.all(workers);                     // resolves when every worker ran dry
  return results;                                 // same order as input, like allSettled
}`;

export interface PoolTask {
  duration: number;
  fails: boolean;
}

export interface PromisePoolInput {
  limit: number;
  tasks: PoolTask[];
}

export interface PromisePoolState {
  time: number;
  limit: number;
  slots: ({ task: number; left: number } | null)[];
  queue: number[];
  /** Completion log in time order. */
  done: { task: number; at: number; ok: boolean }[];
  /** Input-ordered results; null while pending. */
  results: (null | "ok" | "err")[];
  tasks: PoolTask[];
  maxInFlight: number;
}

/** "2; 3, 1, 2!, 4" → limit 2, four tasks, the third rejects. */
export function parsePromisePool(raw: string): ParseResult<PromisePoolInput> {
  const parts = splitParts(raw, 2);
  if (!parts.ok) return parts;
  const limit = parseInteger(parts.value[0], "limit", 1, 8);
  if (!limit.ok) return limit;
  const items = parts.value[1].split(/[\s,]+/).filter(Boolean);
  if (items.length < 1 || items.length > 10) return fail("Give 1–10 task durations.", "1–10 ta task davomiyligini kiriting.");
  const tasks: PoolTask[] = [];
  for (const item of items) {
    const m = /^([1-9])(!?)$/.exec(item);
    if (!m) return fail(`"${item}" must be a duration 1–9, optionally followed by ! (rejects).`, `"${item}" 1–9 oraligʻidagi davomiylik boʻlishi kerak, ixtiyoriy ! bilan (reject boʻladi).`);
    tasks.push({ duration: Number(m[1]), fails: m[2] === "!" });
  }
  return ok({ limit: limit.value, tasks });
}

export function promisePoolSteps({ limit, tasks }: PromisePoolInput) {
  const rec = recorder<PromisePoolState>();
  const workers = Math.min(limit, tasks.length);
  const st: PromisePoolState = {
    time: 0,
    limit,
    slots: new Array(workers).fill(null),
    queue: tasks.map((_, i) => i + 1),
    done: [],
    results: tasks.map(() => null),
    tasks,
    maxInFlight: 0,
  };
  rec.push(
    st,
    11,
    `${tasks.length} task factories (functions, not promises — nothing has started yet). We start ${workers} worker loop(s), so at most ${workers} request(s) are ever in flight.`,
    `${tasks.length} ta task factory (promise emas, funksiya — hali hech narsa boshlanmagan). ${workers} ta worker loop ishga tushiramiz, shuning uchun bir vaqtda koʻpi bilan ${workers} ta request bajariladi.`,
  );

  const claim = () => {
    for (let w = 0; w < st.slots.length; w++) {
      if (!st.slots[w] && st.queue.length) {
        const task = st.queue.shift() as number;
        st.slots[w] = { task, left: tasks[task - 1].duration };
      }
    }
    st.maxInFlight = Math.max(st.maxInFlight, st.slots.filter(Boolean).length);
  };
  claim();
  rec.push(
    st,
    6,
    `Each worker claims the next index with next++ — synchronous, so two workers can never take the same task.${st.queue.length ? ` ${st.queue.length} task(s) wait in the queue.` : ""}`,
    `Har bir worker keyingi indeksni next++ bilan oladi — bu sinxron, shuning uchun ikki worker hech qachon bitta task'ni olmaydi.${st.queue.length ? ` ${st.queue.length} ta task navbatda kutmoqda.` : ""}`,
  );

  while (st.slots.some(Boolean)) {
    const busy = st.slots.filter((x): x is { task: number; left: number } => x !== null);
    const step = Math.min(...busy.map((x) => x.left));
    st.time += step;
    const finished: number[] = [];
    st.slots = st.slots.map((x) => {
      if (!x) return null;
      if (x.left - step <= 0) {
        const okResult = !tasks[x.task - 1].fails;
        finished.push(x.task);
        st.done.push({ task: x.task, at: st.time, ok: okResult });
        st.results[x.task - 1] = okResult ? "ok" : "err";
        return null;
      }
      return { task: x.task, left: x.left - step };
    });
    const failed = finished.filter((t) => tasks[t - 1].fails);
    claim();
    rec.push(
      st,
      failed.length ? 8 : 7,
      `t = ${st.time}: task(s) ${finished.join(", ")} settled${failed.length ? ` (${failed.join(", ")} rejected — caught, stored as "rejected", the worker keeps going)` : ""}. ${st.slots.some(Boolean) ? "Freed workers loop and claim the next task." : "No tasks left, workers return."}`,
      `t = ${st.time}: ${finished.join(", ")} task(lar) yakunlandi${failed.length ? ` (${failed.join(", ")} reject boʻldi — ushlandi, "rejected" sifatida saqlandi, worker davom etadi)` : ""}. ${st.slots.some(Boolean) ? "Boʻshagan worker'lar aylanib, keyingi task'ni oladi." : "Task qolmadi, worker'lar qaytadi."}`,
    );
  }

  const sequential = tasks.reduce((s, t) => s + t.duration, 0);
  const allAtOnce = Math.max(...tasks.map((t) => t.duration));
  rec.push(
    st,
    14,
    `Done at t = ${st.time} (sequential would take ${sequential}, unlimited Promise.all ${allAtOnce} but with ${tasks.length} requests at once). Results keep input order even though they finished in a different order.`,
    `t = ${st.time} da tugadi (ketma-ket ${sequential}, cheklanmagan Promise.all ${allAtOnce} vaqt olardi, lekin bir vaqtda ${tasks.length} ta request bilan). Natijalar boshqa tartibda tugagan boʻlsa ham input tartibini saqlaydi.`,
  );
  return rec.steps;
}
