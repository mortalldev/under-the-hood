import type { Localized, Step } from "../core/types";

export const closureCode = `function makeCounter() {
  let count = 0;
  return function increment() {
    count++;
    return count;
  };
}
const a = makeCounter();
const b = makeCounter();
a();  // 1
a();  // 2
b();  // 1`;

export interface EnvRecord {
  id: string;
  label: string;
  vars: [string, string][];
  outer: string | null;
  /** False once nothing can reach it — eligible for GC. */
  reachable: boolean;
}

export interface FnObject {
  id: string;
  label: string;
  /** The hidden [[Environment]] slot captured at creation time. */
  env: string;
}

export interface ClosureState {
  envs: EnvRecord[];
  fns: FnObject[];
  stack: string[];
  active: string | null;
}

const g = (vars: [string, string][]): EnvRecord => ({ id: "global", label: "Global", vars, outer: null, reachable: true });
const say = (en: string, uz: string): Localized => ({ en, uz });

/** Hand-authored trace: the program is fixed, so the steps are data. */
export function closureSteps(): Step<ClosureState>[] {
  const mk: FnObject = { id: "mk", label: "makeCounter", env: "global" };
  const steps: Step<ClosureState>[] = [];
  const add = (state: ClosureState, line: number, note: Localized) => steps.push({ state: structuredClone(state), line, note });

  add(
    { envs: [g([["makeCounter", "ƒ"], ["a", "<TDZ>"], ["b", "<TDZ>"]])], fns: [mk], stack: ["global"], active: "global" },
    1,
    say("Before any code runs, the global environment record is created. Function declarations are hoisted fully; const bindings exist but are in the TDZ (uninitialized). makeCounter's [[Environment]] points at Global.", "Hech qanday kod bajarilishidan oldin global environment record yaratiladi. Function declaration'lar toʻliq hoist qilinadi; const binding'lar mavjud, lekin TDZ'da (initsializatsiya qilinmagan). makeCounter'ning [[Environment]]'i Global'ga koʻrsatadi."),
  );
  const e1: EnvRecord = { id: "e1", label: "makeCounter #1", vars: [["count", "0"]], outer: "global", reachable: true };
  add(
    { envs: [g([["makeCounter", "ƒ"], ["a", "<TDZ>"], ["b", "<TDZ>"]]), e1], fns: [mk], stack: ["global", "makeCounter()"], active: "e1" },
    2,
    say("Calling makeCounter creates a NEW environment record. Its outer reference is copied from makeCounter.[[Environment]] (Global) — where the function was defined, not where it was called.", "makeCounter chaqirilganda YANGI environment record yaratiladi. Uning outer reference'i makeCounter.[[Environment]] dan (Global) olinadi — funksiya qayerda chaqirilgani emas, qayerda aniqlangani muhim."),
  );
  const inc1: FnObject = { id: "inc1", label: "increment #1", env: "e1" };
  add(
    { envs: [g([["makeCounter", "ƒ"], ["a", "<TDZ>"], ["b", "<TDZ>"]]), e1], fns: [mk, inc1], stack: ["global", "makeCounter()"], active: "e1" },
    3,
    say("Evaluating the function expression creates a function object whose [[Environment]] slot = the CURRENT environment (makeCounter #1). That reference is the whole closure.", "Function expression baholanganda function object yaratiladi va uning [[Environment]] sloti = JORIY environment (makeCounter #1). Closure'ning oʻzi aynan shu reference."),
  );
  add(
    { envs: [g([["makeCounter", "ƒ"], ["a", "increment #1"], ["b", "<TDZ>"]]), e1], fns: [mk, inc1], stack: ["global"], active: "global" },
    8,
    say("makeCounter returns and its frame is popped — but its environment record stays alive: increment #1 (now reachable via a) still references it. Stack frames and environment records have separate lifetimes.", "makeCounter qaytadi va frame'i pop qilinadi — lekin environment record'i tirik qoladi: increment #1 (endi a orqali yetib boriladi) unga hali reference saqlaydi. Stack frame va environment record'ning umri alohida."),
  );
  const e2: EnvRecord = { id: "e2", label: "makeCounter #2", vars: [["count", "0"]], outer: "global", reachable: true };
  const inc2: FnObject = { id: "inc2", label: "increment #2", env: "e2" };
  add(
    { envs: [g([["makeCounter", "ƒ"], ["a", "increment #1"], ["b", "increment #2"]]), e1, e2], fns: [mk, inc1, inc2], stack: ["global"], active: "global" },
    9,
    say("A second call creates a second, independent environment with its own count. a and b do not share state.", "Ikkinchi chaqiruv oʻzining count'iga ega ikkinchi, mustaqil environment yaratadi. a va b state'ni boʻlishmaydi."),
  );
  const e3: EnvRecord = { id: "e3", label: "increment call", vars: [], outer: "e1", reachable: true };
  const G = g([["makeCounter", "ƒ"], ["a", "increment #1"], ["b", "increment #2"]]);
  add(
    { envs: [G, e1, e2, e3], fns: [mk, inc1, inc2], stack: ["global", "a()"], active: "e3" },
    4,
    say("a() runs increment #1. Its new environment's outer = increment#1.[[Environment]] = makeCounter #1. Resolving `count` walks the scope chain: own record (not found) → makeCounter #1 (found).", "a() increment #1 ni bajaradi. Yangi environment'ning outer'i = increment#1.[[Environment]] = makeCounter #1. `count` ni topish scope chain boʻylab yuradi: oʻz record'i (topilmadi) → makeCounter #1 (topildi)."),
  );
  add(
    { envs: [G, { ...e1, vars: [["count", "1"]] }, e2, e3], fns: [mk, inc1, inc2], stack: ["global", "a()"], active: "e1" },
    4,
    say("count++ writes to the binding in makeCounter #1 — the variable itself is captured, not a copy of its value.", "count++ makeCounter #1 dagi binding'ga yozadi — qiymat nusxasi emas, oʻzgaruvchining oʻzi ushlab qolingan."),
  );
  add(
    { envs: [G, { ...e1, vars: [["count", "2"]] }, e2], fns: [mk, inc1, inc2], stack: ["global"], active: "e1" },
    11,
    say("The second a() call increments the same binding → 2. Each call's own environment (empty here) is discarded after return.", "Ikkinchi a() chaqiruvi oʻsha binding'ni oshiradi → 2. Har bir chaqiruvning oʻz environment'i (bu yerda boʻsh) qaytgandan keyin tashlanadi."),
  );
  add(
    { envs: [G, { ...e1, vars: [["count", "2"]] }, { ...e2, vars: [["count", "1"]] }], fns: [mk, inc1, inc2], stack: ["global"], active: "e2" },
    12,
    say("b() reaches makeCounter #2, so it prints 1.", "b() makeCounter #2 ga yetib boradi, shuning uchun 1 chiqaradi."),
  );
  add(
    {
      envs: [g([["makeCounter", "ƒ"], ["a", "null"], ["b", "increment #2"]]), { ...e1, vars: [["count", "2"]], reachable: false }, { ...e2, vars: [["count", "1"]] }],
      fns: [mk, { ...inc1, label: "increment #1 (unreachable)" }, inc2],
      stack: ["global"],
      active: null,
    },
    12,
    say("If we later set a = null, increment #1 becomes unreachable, and with it makeCounter #1: the GC may now reclaim both. A closure retains its environment exactly as long as the function object is reachable — the root of many memory leaks (listeners, timers, caches).", "Keyinroq a = null qilsak, increment #1 yetib boʻlmaydigan boʻladi, u bilan birga makeCounter #1 ham: endi GC ikkalasini ham tozalashi mumkin. Closure environment'ini aynan function object yetib boriladigan ekan, shuncha vaqt ushlab turadi — koʻp memory leak'larning ildizi (listener'lar, timer'lar, cache'lar)."),
  );
  return steps;
}
