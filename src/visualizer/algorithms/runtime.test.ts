import { describe, expect, it } from "vitest";
import { backpressureSteps } from "./backpressure";
import { closureSteps } from "./closure";
import { consistentHashingSteps, parseConsistentHashing } from "./consistent-hashing";
import { browserPresets, finalOutput, nodePresets, parseEventLoop, type Runtime } from "./event-loop";
import { hiddenClassSteps, parseHiddenClasses } from "./hidden-classes";
import { hooksSteps, parseHooks } from "./hooks-list";
import { loadBalancerSteps } from "./load-balancer";
import { lruSteps, parseLru } from "./lru";
import { markSweepSteps, parseMarkSweep, reachable } from "./mark-sweep";
import { prototypeSteps } from "./prototype-chain";
import { parseReconcile, reconcileSteps } from "./reconciliation";
import { parseRerender, rerenderSteps } from "./rerender";
import { last, randInts, rng } from "./test-utils";
import { parsePromisePool, promisePoolCode, promisePoolSteps } from "./promise-pool";
import { makespan, threadPoolSteps } from "./thread-pool";
import { parseTokenBucket, tokenBucketSteps } from "./token-bucket";

const must = <T,>(r: { ok: true; value: T } | { ok: false }): T => {
  if (!r.ok) throw new Error("parse failed");
  return r.value;
};

const run = (code: string, runtime: Runtime = "browser") => finalOutput(must(parseEventLoop(code, runtime)));

describe("event loop (browser)", () => {
  // Expected orders follow the HTML event loop + ECMAScript job semantics.
  const expected = [["A", "D", "C", "B"], ["1", "2", "3", "4", "5"], ["M1", "T1", "M2", "T2"], ["executor", "sync", "then", "timeout"], ["a1", "b1", "a2", "b2"]];
  browserPresets.forEach((p, i) => {
    it(p.label, () => expect(run(p.input)).toEqual(expected[i]));
  });
  it("orders timers by delay, then registration", () => {
    expect(run(`setTimeout(() => console.log("slow"), 10);\nsetTimeout(() => console.log("fast"), 0);\nsetTimeout(() => console.log("fast2"), 0);`)).toEqual(["fast", "fast2", "slow"]);
  });
  it("drains microtasks queued by microtasks before the next task", () => {
    expect(run(`setTimeout(() => console.log("task"), 0);\nqueueMicrotask(() => {\n  console.log("m1");\n  queueMicrotask(() => console.log("m2"));\n});`)).toEqual(["m1", "m2", "task"]);
  });
  it("rejects Node APIs in the browser runtime", () => {
    expect(parseEventLoop(`setImmediate(() => console.log("x"));`, "browser").ok).toBe(false);
  });
  it("stops runaway scheduling", () => {
    const steps = must(parseEventLoop(`function f() {\n  queueMicrotask(() => f());\n}\nf();`, "browser"));
    expect(finalOutput(steps)).toEqual([]);
  });
});

describe("event loop (node)", () => {
  const expected = [["sync", "nextTick", "promise", "timeout", "immediate"], ["nextTick", "immediate", "timeout"], ["t1", "p1", "t2"]];
  nodePresets.forEach((p, i) => {
    it(p.label, () => expect(run(p.input, "node")).toEqual(expected[i]));
  });
  it("nextTick queued inside a promise waits for the promise queue to drain", () => {
    expect(run(`Promise.resolve().then(() => {\n  console.log("p1");\n  process.nextTick(() => console.log("tick"));\n});\nPromise.resolve().then(() => console.log("p2"));`, "node")).toEqual(["p1", "p2", "tick"]);
  });
});

describe("closure trace", () => {
  it("ends with counters 2 and 1", () => {
    const s = last(closureSteps()).state;
    expect(s.envs.find((e) => e.id === "e1")?.vars).toEqual([["count", "2"]]);
    expect(s.envs.find((e) => e.id === "e2")?.vars).toEqual([["count", "1"]]);
  });
});

describe("mark & sweep", () => {
  it("frees exactly the unreachable objects, including cycles", () => {
    const input = must(parseMarkSweep("a; a>b, b>c, d>e, e>d"));
    const s = last(markSweepSteps(input)).state;
    expect([...s.marked].sort()).toEqual(reachable(input).sort());
    expect([...s.freed].sort()).toEqual(["d", "e"]);
  });
});

describe("prototype chain", () => {
  it.each([["name", 0], ["bark", 1], ["speak", 2], ["hasOwnProperty", 3], ["toString", 0], ["missing", null]])("%s found at %s", (key, at) => {
    expect(last(prototypeSteps(String(key))).state.found).toBe(at);
  });
});

describe("hidden classes", () => {
  it("same order shares a shape; different order does not", () => {
    const s = last(hiddenClassSteps(must(parseHiddenClasses("p1: x, y; p2: x, y; p3: y, x")))).state;
    const shape = (n: string) => s.objects.find((o) => o.name === n)?.shape;
    expect(shape("p1")).toBe(shape("p2"));
    expect(shape("p1")).not.toBe(shape("p3"));
    expect(s.icShapes).toHaveLength(2);
  });
});

describe("reconciliation", () => {
  it("moving the last item first moves all the others (keyed)", () => {
    const s = last(reconcileSteps(must(parseReconcile("A B C D; D A B C")), "keyed")).state;
    expect(s.ops.filter((o) => o.kind === "move").map((o) => o.text)).toEqual(["move A", "move B", "move C"]);
  });
  it("moving the first item last moves one (keyed)", () => {
    const s = last(reconcileSteps(must(parseReconcile("A B C D; B C D A")), "keyed")).state;
    expect(s.ops.filter((o) => o.kind === "move").map((o) => o.text)).toEqual(["move A"]);
  });
  it("inserts and removes by key", () => {
    const s = last(reconcileSteps(must(parseReconcile("A B C; A C X")), "keyed")).state;
    expect(s.ops.map((o) => o.text).sort()).toEqual(["insert X", "remove B"]);
  });
  it("index keys keep state by position", () => {
    const s = last(reconcileSteps(must(parseReconcile("A B C; B C")), "index")).state;
    expect(s.stateFrom).toEqual(["A", "B"]);
    expect(s.ops.map((o) => o.text)).toContain("remove C");
  });
});

describe("re-render propagation", () => {
  it("memo bails out unless props are unstable", () => {
    const s = last(rerenderSteps(must(parseRerender("App(Header, Main(List*, Chart*!, Sidebar(Ad)), Footer); Main")))).state;
    expect(s.rendered).toEqual(["Main", "Chart", "Sidebar", "Ad"]);
    expect(s.skipped).toEqual(["List"]);
  });
});

describe("hooks list", () => {
  it("detects order change and count change", () => {
    expect(last(hooksSteps(must(parseHooks("useState, useEffect, useRef; useState, useEffect, useRef")))).state.error).toBeNull();
    expect(last(hooksSteps(must(parseHooks("useState, useEffect, useRef; useState, useRef")))).state.error).toMatch(/useRef received/);
    expect(last(hooksSteps(must(parseHooks("useState, useRef; useState")))).state.error).toMatch(/fewer/);
    expect(last(hooksSteps(must(parseHooks("useState; useState, useRef")))).state.error).toMatch(/more/);
  });
});

describe("backpressure", () => {
  it("bounds the buffer when respected and delivers everything", () => {
    const s = last(backpressureSteps({ produceRate: 5, consumeRate: 2, highWaterMark: 4, total: 30, respect: true })).state;
    expect(s.consumed).toBe(30);
    expect(s.maxBuffered).toBeLessThanOrEqual(4 + 5);
  });
  it("buffer grows when ignored", () => {
    const s = last(backpressureSteps({ produceRate: 5, consumeRate: 2, highWaterMark: 4, total: 30, respect: false })).state;
    expect(s.maxBuffered).toBeGreaterThan(10);
  });
});

describe("thread pool", () => {
  it("finishes at the greedy makespan", () => {
    for (const input of [{ size: 4, durations: [3, 3, 3, 3, 3, 3] }, { size: 2, durations: [5, 1, 1, 1] }]) {
      expect(last(threadPoolSteps(input)).state.time).toBe(makespan(input));
    }
  });
});

describe("token bucket", () => {
  it("allows a burst then throttles", () => {
    const s = last(tokenBucketSteps(must(parseTokenBucket("3; 1; 0, 0, 0, 0, 1, 1.5, 3")))).state;
    expect(s.results.map((r) => r.ok)).toEqual([true, true, true, false, true, false, true]);
  });
});

describe("consistent hashing", () => {
  it("only keys that land in the new node's arc move", () => {
    const s = last(consistentHashingSteps(must(parseConsistentHashing("A, B, C; k1, k2, k3, k4, k5, k6, k7, k8; D")))).state;
    for (const k of s.keys) if (k.moved) expect(k.owner).toBe("D");
  });
});

describe("LRU", () => {
  it("evicts least recently used", () => {
    const s = last(lruSteps(must(parseLru("2; put a 1, put b 2, get a, put c 3, get b, get a, get c")))).state;
    expect(s.entries.map(([k]) => k)).toEqual(["a", "c"]);
    expect(s.hits).toBe(3);
    expect(s.misses).toBe(1);
  });
});

describe("load balancer", () => {
  it("least-connections never has a higher peak than round-robin here", () => {
    const input = { servers: 2, durations: [6, 1, 6, 1, 6, 1, 6, 1] };
    const rr = last(loadBalancerSteps(input, "round-robin")).state.maxActive;
    const lc = last(loadBalancerSteps(input, "least-connections")).state.maxActive;
    expect(Math.max(...lc)).toBeLessThanOrEqual(Math.max(...rr));
  });
});

describe("promise pool", () => {
  it("never exceeds the limit and matches greedy list scheduling", () => {
    const rand = rng(7);
    for (let k = 0; k < 50; k++) {
      const durations = randInts(rand, 1 + Math.floor(rand() * 9), 1, 9);
      const limit = 1 + Math.floor(rand() * 4);
      const input = { limit, tasks: durations.map((duration) => ({ duration, fails: false })) };
      const steps = promisePoolSteps(input);
      for (const s of steps) expect(s.state.slots.filter(Boolean).length).toBeLessThanOrEqual(limit);
      const end = last(steps).state;
      expect(end.time).toBe(makespan({ size: Math.min(limit, durations.length), durations }));
      expect(end.results.every((r) => r === "ok")).toBe(true);
    }
  });

  it("keeps going after a rejection and records it in input order", () => {
    const end = last(promisePoolSteps(must(parsePromisePool("2; 4, 1, 3!, 2, 2")))).state;
    expect(end.results).toEqual(["ok", "ok", "err", "ok", "ok"]);
    expect(end.done.map((d) => d.task)).toEqual([2, 1, 3, 4, 5]);
  });

  it("the displayed pool code really behaves like the model", async () => {
    // Run the exact source shown in the visualizer with real (tiny) timers.
    const pool = new Function(`${promisePoolCode}; return pool;`)() as (
      tasks: (() => Promise<number>)[],
      limit: number,
    ) => Promise<{ status: string }[]>;
    let inFlight = 0;
    let peak = 0;
    const task = (ms: number, fails = false) => async () => {
      inFlight++;
      peak = Math.max(peak, inFlight);
      await new Promise((r) => setTimeout(r, ms));
      inFlight--;
      if (fails) throw new Error("boom");
      return ms;
    };
    const res = await pool([task(8), task(2), task(6, true), task(4), task(4)], 2);
    expect(peak).toBe(2);
    expect(res.map((r) => r.status)).toEqual(["fulfilled", "fulfilled", "rejected", "fulfilled", "fulfilled"]);
  });

  it("rejects bad input", () => {
    expect(parsePromisePool("0; 1, 2").ok).toBe(false);
    expect(parsePromisePool("2; 1, x").ok).toBe(false);
    expect(parsePromisePool("2; 1, 10").ok).toBe(false);
  });
});
