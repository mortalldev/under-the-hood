import { parseInteger, parseNumbers, splitParts } from "../core/parse";
import { recorder } from "../core/recorder";
import { fail, ok, type ParseResult } from "../core/types";

export const threadPoolCode = `// UV_THREADPOOL_SIZE defaults to 4 (set it before the pool is first used)
const crypto = require("node:crypto");
const start = Date.now();
for (let i = 1; i <= 6; i++) {
  crypto.pbkdf2("pw", "salt", 1e6, 64, "sha512", () => {
    console.log(i, Date.now() - start, "ms");   // 4 finish together, then 2
  });
}
// Network sockets do NOT use this pool: the OS notifies libuv (epoll/kqueue/IOCP).`;

export interface ThreadPoolInput {
  size: number;
  durations: number[];
}

export interface ThreadPoolState {
  time: number;
  threads: ({ task: number; left: number } | null)[];
  queue: number[];
  done: { task: number; at: number }[];
  durations: number[];
}

export function parseThreadPool(raw: string): ParseResult<ThreadPoolInput> {
  const parts = splitParts(raw, 2);
  if (!parts.ok) return parts;
  const size = parseInteger(parts.value[0], "pool size", 1, 8);
  if (!size.ok) return size;
  const d = parseNumbers(parts.value[1], { min: 1, max: 10, label: "durations" });
  if (!d.ok) return d;
  if (d.value.some((x) => x < 1 || x > 9)) return fail("Each duration must be 1–9.", "Har bir davomiylik 1–9 boʻlishi kerak.");
  return ok({ size: size.value, durations: d.value });
}

export function threadPoolSteps({ size, durations }: ThreadPoolInput) {
  const rec = recorder<ThreadPoolState>();
  const st: ThreadPoolState = { time: 0, threads: new Array(size).fill(null), queue: durations.map((_, i) => i + 1), done: [], durations };
  rec.push(st, 4, `${durations.length} CPU-heavy tasks submitted at once. The main thread only queues them and keeps running JS; libuv hands them to ${size} worker thread(s).`, `${durations.length} ta CPU-ogʻir task bir vaqtda yuborildi. Main thread ularni faqat navbatga qoʻyadi va JS bajarishda davom etadi; libuv ularni ${size} ta worker thread'ga beradi.`);

  const assign = () => {
    for (let t = 0; t < st.threads.length; t++) {
      if (!st.threads[t] && st.queue.length) {
        const task = st.queue.shift() as number;
        st.threads[t] = { task, left: durations[task - 1] };
      }
    }
  };
  assign();
  rec.push(st, 5, `Free threads pick tasks from the FIFO queue. ${st.queue.length ? `${st.queue.length} task(s) must wait — this queueing is invisible in your code.` : "Everything fits."}`, `Boʻsh thread'lar FIFO queue'dan task oladi. ${st.queue.length ? `${st.queue.length} ta task kutishi kerak — bu navbat kodingizda koʻrinmaydi.` : "Hammasi sigʻdi."}`);

  while (st.threads.some(Boolean) || st.queue.length) {
    const step = Math.min(...st.threads.filter((x): x is { task: number; left: number } => x !== null).map((x) => x.left));
    st.time += step;
    const finished: number[] = [];
    st.threads = st.threads.map((x) => {
      if (!x) return null;
      if (x.left - step <= 0) {
        finished.push(x.task);
        st.done.push({ task: x.task, at: st.time });
        return null;
      }
      return { task: x.task, left: x.left - step };
    });
    assign();
    rec.push(st, 6, `t = ${st.time}: task(s) ${finished.join(", ")} finished; their callbacks are queued back to the main thread's event loop.${st.queue.length || st.threads.some(Boolean) ? " Freed threads take the next queued tasks." : ""}`, `t = ${st.time}: ${finished.join(", ")} task(lar) tugadi; ularning callback'lari main thread'ning event loop'iga qaytariladi.${st.queue.length || st.threads.some(Boolean) ? " Boʻshagan thread'lar navbatdagi task'larni oladi." : ""}`);
  }
  rec.push(st, 9, `All done at t = ${st.time}. Pool size caps parallelism for fs, dns.lookup, crypto.pbkdf2/scrypt/randomBytes (async) and zlib (async). A slow dns.lookup can therefore delay unrelated fs reads.`, `Hammasi t = ${st.time} da tugadi. Pool hajmi fs, dns.lookup, crypto.pbkdf2/scrypt/randomBytes (async) va zlib (async) uchun parallelizmni cheklaydi. Shuning uchun sekin dns.lookup bogʻliq boʻlmagan fs oʻqishlarni kechiktirishi mumkin.`);
  return rec.steps;
}

export function makespan({ size, durations }: ThreadPoolInput): number {
  const free = new Array<number>(size).fill(0);
  let end = 0;
  for (const d of durations) {
    const i = free.indexOf(Math.min(...free));
    free[i] += d;
    end = Math.max(end, free[i]);
  }
  return end;
}
