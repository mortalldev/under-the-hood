import { recorder } from "../core/recorder";
import { fail, ok, type ParseResult } from "../core/types";

/**
 * A tiny interpreter for a subset of JavaScript that only cares about *when*
 * callbacks run. Browser and Node scheduling rules are modeled explicitly.
 *
 * Model assumptions (stated in the UI):
 * - All synchronous code is instantaneous; only timers advance the clock.
 * - `await x` awaits an already-settled value: the continuation is one microtask.
 * - Node: `fs.readFile` completes by the next poll phase; the loop starts ≥ 1 ms
 *   after the main script, so an expired `setTimeout(0)` runs before
 *   `setImmediate` — real Node does not guarantee that order from the main module.
 */

export type Runtime = "browser" | "node";

type Block = Stmt[];

type Stmt =
  | { k: "log"; text: string; line: number }
  | { k: "timeout"; delay: number; body: Callback; line: number }
  | { k: "immediate"; body: Callback; line: number }
  | { k: "nextTick"; body: Callback; line: number }
  | { k: "microtask"; body: Callback; line: number }
  | { k: "readFile"; body: Callback; line: number }
  | { k: "promise"; executor: { param: string; body: Block } | null; thens: Callback[]; line: number }
  | { k: "resolve"; name: string; line: number }
  | { k: "declare"; name: string; isAsync: boolean; body: Block; line: number }
  | { k: "call"; name: string; line: number }
  | { k: "await"; line: number };

interface Callback {
  body: Block;
  isAsync: boolean;
  line: number;
}

export interface Program {
  runtime: Runtime;
  code: string;
  body: Block;
}

/* ───────────────────────── tokenizer ───────────────────────── */

interface Token {
  t: "id" | "str" | "num" | "p";
  v: string;
  line: number;
}

function tokenize(src: string): Token[] | string {
  const out: Token[] = [];
  let i = 0;
  let line = 1;
  while (i < src.length) {
    const c = src[i];
    if (c === "\n") {
      line++;
      i++;
    } else if (/\s/.test(c)) i++;
    else if (src.startsWith("//", i)) {
      while (i < src.length && src[i] !== "\n") i++;
    } else if (src.startsWith("/*", i)) {
      const end = src.indexOf("*/", i + 2);
      if (end === -1) return `line ${line}: unterminated comment`;
      line += src.slice(i, end).split("\n").length - 1;
      i = end + 2;
    } else if (/[A-Za-z_$]/.test(c)) {
      let j = i;
      while (j < src.length && /[\w$]/.test(src[j])) j++;
      out.push({ t: "id", v: src.slice(i, j), line });
      i = j;
    } else if (/\d/.test(c)) {
      let j = i;
      while (j < src.length && /\d/.test(src[j])) j++;
      out.push({ t: "num", v: src.slice(i, j), line });
      i = j;
    } else if (c === '"' || c === "'" || c === "`") {
      let j = i + 1;
      while (j < src.length && src[j] !== c && src[j] !== "\n") j++;
      if (src[j] !== c) return `line ${line}: unterminated string`;
      const v = src.slice(i + 1, j);
      if (c === "`" && v.includes("${")) return `line ${line}: template interpolation is not supported`;
      out.push({ t: "str", v, line });
      i = j + 1;
    } else if (src.startsWith("=>", i)) {
      out.push({ t: "p", v: "=>", line });
      i += 2;
    } else if ("(){};,.".includes(c)) {
      out.push({ t: "p", v: c, line });
      i++;
    } else return `line ${line}: unexpected "${c}"`;
  }
  return out;
}

/* ───────────────────────── parser ───────────────────────── */

class ParseError extends Error {}

const SUPPORTED_EN =
  "Supported: console.log(...), setTimeout(cb, ms), queueMicrotask(cb), Promise.resolve().then(cb), new Promise((resolve) => { ... }).then(cb), async function f() { ... await x; ... }, f(), function f() {}";
const SUPPORTED_UZ =
  "Qoʻllab-quvvatlanadi: console.log(...), setTimeout(cb, ms), queueMicrotask(cb), Promise.resolve().then(cb), new Promise((resolve) => { ... }).then(cb), async function f() { ... await x; ... }, f(), function f() {}";

class Parser {
  private pos = 0;
  constructor(
    private readonly toks: Token[],
    private readonly runtime: Runtime,
  ) {}

  private peek(offset = 0): Token | undefined {
    return this.toks[this.pos + offset];
  }
  private next(): Token {
    const tok = this.toks[this.pos++];
    if (!tok) throw new ParseError("unexpected end of code");
    return tok;
  }
  private is(v: string, offset = 0) {
    return this.peek(offset)?.v === v;
  }
  private expect(v: string) {
    const tok = this.next();
    if (tok.v !== v) throw new ParseError(`line ${tok.line}: expected "${v}" but found "${tok.v}"`);
    return tok;
  }
  private skipSemis() {
    while (this.is(";")) this.pos++;
  }

  program(): Block {
    const body: Block = [];
    this.skipSemis();
    while (this.peek()) {
      body.push(this.statement({ inAsync: false, resolvers: [] }));
      this.skipSemis();
    }
    return body;
  }

  private block(ctx: Ctx): Block {
    this.expect("{");
    const body: Block = [];
    this.skipSemis();
    while (!this.is("}")) {
      if (!this.peek()) throw new ParseError("missing }");
      body.push(this.statement(ctx));
      this.skipSemis();
    }
    this.expect("}");
    return body;
  }

  private nodeOnly(tok: Token) {
    if (this.runtime !== "node") throw new ParseError(`line ${tok.line}: ${tok.v} exists only in Node.js — switch the runtime`);
  }

  private literal(): string {
    const tok = this.next();
    if (tok.t === "str" || tok.t === "num" || tok.t === "id") return tok.v;
    throw new ParseError(`line ${tok.line}: expected a value`);
  }

  private callback(ctx: Ctx): Callback {
    const start = this.peek();
    let isAsync = false;
    if (this.is("async")) {
      this.pos++;
      isAsync = true;
    }
    const line = start?.line ?? 0;
    const inner: Ctx = { inAsync: isAsync, resolvers: ctx.resolvers };
    if (this.is("function")) {
      this.pos++;
      this.expect("(");
      if (!this.is(")")) this.next();
      this.expect(")");
      return { body: this.block(inner), isAsync, line };
    }
    if (this.is("(")) {
      this.pos++;
      if (!this.is(")")) this.next();
      this.expect(")");
    } else if (this.peek()?.t === "id") this.pos++;
    else throw new ParseError(`line ${line}: expected a callback like () => { ... }`);
    this.expect("=>");
    if (this.is("{")) return { body: this.block(inner), isAsync, line };
    return { body: [this.statement(inner)], isAsync, line };
  }

  private thens(ctx: Ctx): Callback[] {
    const out: Callback[] = [];
    while (this.is(".")) {
      this.pos++;
      const tok = this.next();
      if (tok.v !== "then") throw new ParseError(`line ${tok.line}: only .then(cb) is supported on promises`);
      this.expect("(");
      const cb = this.callback(ctx);
      if (cb.isAsync) throw new ParseError(`line ${tok.line}: async .then callbacks are not modeled`);
      out.push(cb);
      this.expect(")");
    }
    return out;
  }

  private statement(ctx: Ctx): Stmt {
    const tok = this.next();
    const line = tok.line;
    switch (tok.v) {
      case "console": {
        this.expect(".");
        this.expect("log");
        this.expect("(");
        const parts: string[] = [];
        while (!this.is(")")) {
          parts.push(this.literal());
          if (this.is(",")) this.pos++;
        }
        this.expect(")");
        return { k: "log", text: parts.join(" "), line };
      }
      case "setTimeout": {
        this.expect("(");
        const body = this.callback(ctx);
        let delay = 0;
        if (this.is(",")) {
          this.pos++;
          const d = this.next();
          if (d.t !== "num") throw new ParseError(`line ${d.line}: delay must be a number`);
          delay = Math.min(Number(d.v), 10000);
        }
        this.expect(")");
        return { k: "timeout", delay, body, line };
      }
      case "setImmediate":
        this.nodeOnly(tok);
        this.expect("(");
        return this.finishCall({ k: "immediate", body: this.callback(ctx), line });
      case "queueMicrotask":
        this.expect("(");
        return this.finishCall({ k: "microtask", body: this.callback(ctx), line });
      case "process":
        this.nodeOnly(tok);
        this.expect(".");
        this.expect("nextTick");
        this.expect("(");
        return this.finishCall({ k: "nextTick", body: this.callback(ctx), line });
      case "fs": {
        this.nodeOnly(tok);
        this.expect(".");
        this.expect("readFile");
        this.expect("(");
        this.literal();
        this.expect(",");
        return this.finishCall({ k: "readFile", body: this.callback(ctx), line });
      }
      case "Promise": {
        this.expect(".");
        this.expect("resolve");
        this.expect("(");
        if (!this.is(")")) this.literal();
        this.expect(")");
        return { k: "promise", executor: null, thens: this.thens(ctx), line };
      }
      case "new": {
        this.expect("Promise");
        this.expect("(");
        let param: string;
        let body: Block;
        if (this.is("function")) {
          this.pos++;
          this.expect("(");
          param = this.next().v;
          this.expect(")");
          body = this.block({ inAsync: false, resolvers: [...ctx.resolvers, param] });
        } else {
          if (this.is("(")) {
            this.pos++;
            param = this.next().v;
            this.expect(")");
          } else param = this.next().v;
          this.expect("=>");
          body = this.block({ inAsync: false, resolvers: [...ctx.resolvers, param] });
        }
        this.expect(")");
        return { k: "promise", executor: { param, body }, thens: this.thens(ctx), line };
      }
      case "async": {
        this.expect("function");
        const name = this.next().v;
        this.expect("(");
        this.expect(")");
        return { k: "declare", name, isAsync: true, body: this.block({ inAsync: true, resolvers: ctx.resolvers }), line };
      }
      case "function": {
        const name = this.next().v;
        this.expect("(");
        this.expect(")");
        return { k: "declare", name, isAsync: false, body: this.block({ inAsync: false, resolvers: ctx.resolvers }), line };
      }
      case "await": {
        if (!ctx.inAsync) throw new ParseError(`line ${line}: await is only valid directly inside an async function`);
        if (this.is("Promise")) {
          this.pos++;
          this.expect(".");
          this.expect("resolve");
          this.expect("(");
          if (!this.is(")")) this.literal();
          this.expect(")");
        } else this.literal();
        return { k: "await", line };
      }
      default: {
        if (tok.t === "id" && this.is("(")) {
          this.expect("(");
          if (ctx.resolvers.includes(tok.v)) {
            if (!this.is(")")) this.literal();
            this.expect(")");
            return { k: "resolve", name: tok.v, line };
          }
          this.expect(")");
          return { k: "call", name: tok.v, line };
        }
        throw new ParseError(`line ${line}: "${tok.v}" is not supported here`);
      }
    }
  }

  private finishCall<S extends Stmt>(s: S): S {
    this.expect(")");
    return s;
  }
}

interface Ctx {
  inAsync: boolean;
  resolvers: string[];
}

export function parseEventLoop(code: string, runtime: Runtime): ParseResult<Program> {
  if (code.length > 2000) return fail("Keep the program under 2000 characters.", "Dastur 2000 belgidan qisqa boʻlsin.");
  const toks = tokenize(code);
  if (typeof toks === "string") return fail(`${toks}. ${SUPPORTED_EN}`, `${toks}. ${SUPPORTED_UZ}`);
  try {
    const body = new Parser(toks, runtime).program();
    if (body.length === 0) return fail("Write at least one statement.", "Kamida bitta statement yozing.");
    return ok({ runtime, code, body });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return fail(`${msg}. ${SUPPORTED_EN}`, `${msg}. ${SUPPORTED_UZ}`);
  }
}

/* ───────────────────────── simulator ───────────────────────── */

export interface QueueEntry {
  id: number;
  label: string;
}

export interface EventLoopState {
  runtime: Runtime;
  stack: QueueEntry[];
  webApis: QueueEntry[];
  tasks: QueueEntry[];
  microtasks: QueueEntry[];
  ticks: QueueEntry[];
  immediates: QueueEntry[];
  io: QueueEntry[];
  phase: string | null;
  console: string[];
  now: number;
}

type Env = Record<string, number>;

interface Job {
  id: number;
  label: string;
  body: Block;
  env: Env;
  /** Remaining .then callbacks to schedule after this one returns. */
  chain: Callback[];
  /** Name of the async function this job resumes, if any. */
  resumes: string | null;
  isAsync: boolean;
  fireAt?: number;
  seq: number;
}

const MAX_STEPS = 400;

export function eventLoopSteps(program: Program) {
  const rec = recorder<EventLoopState>();
  const { runtime } = program;
  const st: EventLoopState = {
    runtime,
    stack: [],
    webApis: [],
    tasks: [],
    microtasks: [],
    ticks: [],
    immediates: [],
    io: [],
    phase: null,
    console: [],
    now: 0,
  };

  const functions = new Map<string, { isAsync: boolean; body: Block }>();
  const promises: { resolved: boolean; reactions: Callback[][]; env: Env }[] = [];
  let nextId = 1;
  let seq = 0;
  let budgetHit = false;

  // Real queues (jobs); `st` mirrors their labels for rendering.
  const timers: Job[] = [];
  const tasks: Job[] = [];
  const micro: Job[] = [];
  const ticks: Job[] = [];
  const immediates: Job[] = [];
  const pendingIo: Job[] = [];
  const readyIo: Job[] = [];

  const entry = (j: Job): QueueEntry => ({ id: j.id, label: j.label });
  const sync = () => {
    st.webApis = [
      ...[...timers].sort((a, b) => (a.fireAt ?? 0) - (b.fireAt ?? 0) || a.seq - b.seq).map((j) => ({ id: j.id, label: `${j.label} @${j.fireAt}ms` })),
      ...pendingIo.map((j) => ({ id: j.id, label: `${j.label} (I/O)` })),
    ];
    st.tasks = tasks.map(entry);
    st.microtasks = micro.map(entry);
    st.ticks = ticks.map(entry);
    st.immediates = immediates.map(entry);
    st.io = readyIo.map(entry);
  };
  const push = (line: number | undefined, en: string, uz: string) => {
    if (rec.steps.length >= MAX_STEPS) {
      budgetHit = true;
      return;
    }
    sync();
    rec.push(st, line, en, uz);
  };

  const job = (label: string, cb: Callback, env: Env, chain: Callback[] = []): Job => ({
    id: nextId++,
    label,
    body: cb.body,
    env,
    chain,
    resumes: null,
    isAsync: cb.isAsync,
    seq: seq++,
  });

  const firstLog = (b: Block): string | null => {
    for (const s of b) if (s.k === "log") return s.text;
    return null;
  };
  const labelFor = (kind: string, cb: Callback) => {
    const log = firstLog(cb.body);
    return log ? `${kind}: "${log}"` : `${kind} L${cb.line}`;
  };

  const settle = (pid: number) => {
    const p = promises[pid];
    if (p.resolved) return;
    p.resolved = true;
    for (const chain of p.reactions) {
      const [first, ...rest] = chain;
      micro.push(job(labelFor("then", first), first, p.env, rest));
    }
    p.reactions = [];
  };

  /** Runs statements; returns early when an `await` suspends the function. */
  const runBlock = (body: Block, env: Env, asyncName: string | null, isAsync: boolean): void => {
    for (let i = 0; i < body.length; i++) {
      if (budgetHit) return;
      const s = body[i];
      switch (s.k) {
        case "log":
          st.console.push(s.text);
          push(s.line, `console.log("${s.text}") runs synchronously on the call stack → output.`, `console.log("${s.text}") call stack'da sinxron bajariladi → output.`);
          break;
        case "timeout": {
          const delay = runtime === "node" ? Math.max(1, s.delay) : s.delay;
          const j = job(labelFor("timeout", s.body), s.body, env);
          j.fireAt = st.now + delay;
          timers.push(j);
          push(
            s.line,
            runtime === "node"
              ? `setTimeout(…, ${s.delay}) registers a timer that expires at ${j.fireAt}ms (Node coerces 0 to 1 ms). The callback does not go to any queue yet.`
              : `setTimeout(…, ${s.delay}) hands a timer to the browser (Web APIs). Only when it expires (at ${j.fireAt}ms) does its callback become a task.`,
            runtime === "node"
              ? `setTimeout(…, ${s.delay}) ${j.fireAt}ms da tugaydigan timer roʻyxatga oladi (Node 0 ni 1 ms ga aylantiradi). Callback hali hech qaysi queue'ga tushmaydi.`
              : `setTimeout(…, ${s.delay}) timer'ni brauzerga (Web APIs) beradi. Faqat u tugaganda (${j.fireAt}ms da) callback task'ga aylanadi.`,
          );
          break;
        }
        case "immediate":
          immediates.push(job(labelFor("immediate", s.body), s.body, env));
          push(s.line, `setImmediate queues the callback for the check phase of the event loop.`, `setImmediate callback'ni event loop'ning check phase'iga navbatga qoʻyadi.`);
          break;
        case "nextTick":
          ticks.push(job(labelFor("nextTick", s.body), s.body, env));
          push(s.line, `process.nextTick queues into the nextTick queue — it runs before promise microtasks, as soon as the current operation finishes.`, `process.nextTick nextTick queue'ga qoʻshadi — u joriy amal tugashi bilan, promise microtask'laridan oldin bajariladi.`);
          break;
        case "microtask":
          micro.push(job(labelFor("microtask", s.body), s.body, env));
          push(s.line, `queueMicrotask puts the callback straight into the microtask queue.`, `queueMicrotask callback'ni toʻgʻridan-toʻgʻri microtask queue'ga qoʻyadi.`);
          break;
        case "readFile":
          pendingIo.push(job(labelFor("readFile cb", s.body), s.body, env));
          push(s.line, `fs.readFile starts asynchronous I/O in libuv. Its callback will run in a poll phase once the read completes.`, `fs.readFile libuv'da asinxron I/O boshlaydi. Oʻqish tugagach, callback poll phase'da bajariladi.`);
          break;
        case "promise": {
          const pid = promises.length;
          promises.push({ resolved: false, reactions: [], env });
          if (s.executor) {
            st.stack.push({ id: nextId++, label: "Promise executor" });
            push(s.line, `new Promise(executor): the executor runs synchronously, right now.`, `new Promise(executor): executor hozirning oʻzida sinxron bajariladi.`);
            runBlock(s.executor.body, { ...env, [s.executor.param]: pid }, null, false);
            st.stack.pop();
          } else {
            promises[pid].resolved = true;
          }
          if (s.thens.length) {
            const [first, ...rest] = s.thens;
            if (promises[pid].resolved) {
              micro.push(job(labelFor("then", first), first, env, rest));
              push(s.line, `.then on an already-fulfilled promise: the callback is queued as a microtask immediately. Later .then calls in the chain wait for the previous callback to return.`, `Allaqachon fulfilled promise'dagi .then: callback darhol microtask sifatida navbatga qoʻyiladi. Zanjirdagi keyingi .then'lar oldingi callback qaytishini kutadi.`);
            } else {
              promises[pid].reactions.push(s.thens);
              push(s.line, `.then on a pending promise: the callback is stored as a reaction, not queued. It is queued only when resolve() is called.`, `Pending promise'dagi .then: callback reaction sifatida saqlanadi, navbatga qoʻyilmaydi. U faqat resolve() chaqirilganda navbatga tushadi.`);
            }
          }
          break;
        }
        case "resolve": {
          const pid = env[s.name];
          if (pid === undefined) break;
          const had = promises[pid].reactions.length;
          settle(pid);
          push(s.line, had ? `resolve() fulfills the promise and queues its ${had} waiting .then reaction(s) as microtasks.` : `resolve() fulfills the promise (no .then attached yet).`, had ? `resolve() promise'ni fulfill qiladi va kutayotgan ${had} ta .then reaction'ni microtask sifatida navbatga qoʻyadi.` : `resolve() promise'ni fulfill qiladi (hali .then ulanmagan).`);
          break;
        }
        case "declare":
          functions.set(s.name, { isAsync: s.isAsync, body: s.body });
          push(s.line, `Function declaration "${s.name}" — nothing runs yet.`, `"${s.name}" funksiya e'loni — hali hech narsa bajarilmaydi.`);
          break;
        case "call": {
          const fn = functions.get(s.name);
          if (!fn) {
            push(s.line, `ReferenceError: ${s.name} is not defined (declare it above the call in this model).`, `ReferenceError: ${s.name} aniqlanmagan (bu modelda uni chaqiruvdan yuqorida e'lon qiling).`);
            break;
          }
          if (st.stack.length > 30) {
            push(s.line, `RangeError: Maximum call stack size exceeded.`, `RangeError: Maximum call stack size exceeded.`);
            budgetHit = true;
            return;
          }
          st.stack.push({ id: nextId++, label: `${s.name}()` });
          push(s.line, fn.isAsync ? `Call async ${s.name}(): its body runs synchronously until the first await.` : `Call ${s.name}(): push a frame.`, fn.isAsync ? `async ${s.name}() chaqiriladi: uning tanasi birinchi await'gacha sinxron bajariladi.` : `${s.name}() chaqiriladi: frame push qilinadi.`);
          runBlock(fn.body, env, fn.isAsync ? s.name : null, fn.isAsync);
          st.stack.pop();
          push(s.line, `${s.name}() returns${fn.isAsync ? " (a promise)" : ""}; pop its frame.`, `${s.name}() qaytadi${fn.isAsync ? " (promise)" : ""}; frame pop qilinadi.`);
          break;
        }
        case "await": {
          const name = asyncName ?? "async callback";
          const rest = body.slice(i + 1);
          micro.push({ id: nextId++, label: `${name} after await`, body: rest, env, chain: [], resumes: name, isAsync, seq: seq++ });
          push(s.line, `await: the function suspends here. Its continuation (the rest of the body) is queued as a microtask; control returns to the caller.`, `await: funksiya shu yerda toʻxtaydi. Davomi (tananing qolgani) microtask sifatida navbatga qoʻyiladi; boshqaruv chaqiruvchiga qaytadi.`);
          return;
        }
      }
    }
  };

  const runJob = (j: Job, kind: string) => {
    st.stack.push({ id: nextId++, label: j.label });
    push(j.body[0]?.line, `Run ${kind} "${j.label}" on the empty call stack.`, `${kind} "${j.label}" boʻsh call stack'da bajariladi.`);
    runBlock(j.body, j.env, j.resumes, j.isAsync);
    st.stack.pop();
    if (j.chain.length) {
      const [first, ...rest] = j.chain;
      micro.push(job(labelFor("then", first), first, j.env, rest));
      push(undefined, `The .then callback returned, so the promise it created fulfills → the next .then in the chain is queued as a microtask.`, `.then callback qaytdi, demak u yaratgan promise fulfill boʻldi → zanjirdagi keyingi .then microtask sifatida navbatga qoʻyiladi.`);
    }
  };

  const drainMicrotasks = () => {
    while (!budgetHit && micro.length) {
      runJob(micro.shift() as Job, "microtask");
    }
  };

  const drainNode = () => {
    while (!budgetHit && (ticks.length || micro.length)) {
      while (!budgetHit && ticks.length) runJob(ticks.shift() as Job, "nextTick");
      while (!budgetHit && micro.length) runJob(micro.shift() as Job, "microtask");
    }
  };

  const moveExpired = () => {
    const expired = timers.filter((t) => (t.fireAt ?? 0) <= st.now).sort((a, b) => (a.fireAt ?? 0) - (b.fireAt ?? 0) || a.seq - b.seq);
    for (const t of expired) timers.splice(timers.indexOf(t), 1);
    return expired;
  };

  /* ── run the main script ── */
  st.stack.push({ id: nextId++, label: runtime === "node" ? "main module" : "script" });
  push(undefined, runtime === "node" ? `Node runs the main module as one synchronous job.` : `The whole script is the first task: it runs to completion before anything else.`, runtime === "node" ? `Node asosiy modulni bitta sinxron ish sifatida bajaradi.` : `Butun skript — birinchi task: boshqa hech narsadan oldin oxirigacha bajariladi.`);
  runBlock(program.body, {}, null, false);
  st.stack.pop();
  push(undefined, `Call stack is empty. Now queued callbacks may run.`, `Call stack boʻsh. Endi navbatdagi callback'lar bajarilishi mumkin.`);

  if (runtime === "browser") {
    if (micro.length) push(undefined, `Microtask checkpoint: drain the WHOLE microtask queue — including microtasks queued while draining — before any other task.`, `Microtask checkpoint: boshqa har qanday task'dan oldin microtask queue TOʻLIQ boʻshatiladi — boʻshatish paytida qoʻshilganlari ham.`);
    drainMicrotasks();
    for (let guard = 0; guard < 80 && !budgetHit; guard++) {
      st.phase = "render";
      push(undefined, `Task done and microtasks empty → the browser may render now (requestAnimationFrame, style, layout, paint) before taking the next task.`, `Task tugadi va microtask'lar boʻsh → brauzer keyingi task'ni olishdan oldin hozir render qilishi mumkin (requestAnimationFrame, style, layout, paint).`);
      st.phase = null;
      for (const t of moveExpired()) tasks.push(t);
      if (!tasks.length) {
        if (!timers.length) break;
        st.now = Math.min(...timers.map((t) => t.fireAt ?? 0));
        for (const t of moveExpired()) tasks.push(t);
        push(undefined, `Nothing to do until t = ${st.now}ms. Expired timer callbacks move into the task queue (in expiry order).`, `t = ${st.now}ms gacha ish yoʻq. Tugagan timer callback'lari task queue'ga oʻtadi (tugash tartibida).`);
      }
      const next = tasks.shift() as Job;
      runJob(next, "task");
      if (micro.length) push(undefined, `Task finished → microtask checkpoint before the next task.`, `Task tugadi → keyingi task'dan oldin microtask checkpoint.`);
      drainMicrotasks();
    }
  } else {
    if (ticks.length || micro.length) push(undefined, `Before the event loop starts: drain process.nextTick queue first, then promise microtasks (repeat until both are empty).`, `Event loop boshlanishidan oldin: avval process.nextTick queue, keyin promise microtask'lari boʻshatiladi (ikkalasi boʻshaguncha takrorlanadi).`);
    drainNode();
    st.now = Math.max(st.now, 1);
    let first = true;
    for (let guard = 0; guard < 40 && !budgetHit; guard++) {
      const expired = moveExpired();
      if (expired.length) {
        st.phase = "timers";
        const warn =
          first && immediates.length
            ? { en: " ⚠ From the main module, real Node may run setImmediate first: it depends on whether 1 ms passed before the loop started.", uz: " ⚠ Asosiy moduldan chaqirilganda, haqiqiy Node setImmediate'ni birinchi bajarishi mumkin: bu loop boshlanishidan oldin 1 ms oʻtgan-oʻtmaganiga bogʻliq." }
            : { en: "", uz: "" };
        push(undefined, `timers phase (t = ${st.now}ms): ${expired.length} expired timer(s) run in order.${warn.en}`, `timers phase (t = ${st.now}ms): ${expired.length} ta tugagan timer tartib bilan bajariladi.${warn.uz}`);
        for (const t of expired) {
          runJob(t, "timer callback");
          if (ticks.length || micro.length) push(undefined, `Since Node 11, nextTicks and microtasks are drained after EACH timer callback, not after the whole phase.`, `Node 11 dan beri nextTick va microtask'lar butun phase'dan keyin emas, HAR BIR timer callback'dan keyin boʻshatiladi.`);
          drainNode();
        }
      }
      first = false;
      readyIo.push(...pendingIo.splice(0));
      if (readyIo.length) {
        st.phase = "poll";
        push(undefined, `poll phase: completed I/O callbacks run.`, `poll phase: tugagan I/O callback'lari bajariladi.`);
        while (readyIo.length && !budgetHit) {
          runJob(readyIo.shift() as Job, "I/O callback");
          drainNode();
        }
      } else if (!immediates.length && timers.length) {
        st.phase = "poll";
        st.now = Math.min(...timers.map((t) => t.fireAt ?? 0));
        push(undefined, `poll phase: nothing ready and no setImmediate pending, so the loop blocks here until the next timer is due (t = ${st.now}ms).`, `poll phase: tayyor ish yoʻq va setImmediate kutilmayapti, shuning uchun loop keyingi timer vaqtigacha (t = ${st.now}ms) shu yerda kutadi.`);
        continue;
      }
      if (immediates.length) {
        st.phase = "check";
        const batch = immediates.splice(0);
        push(undefined, `check phase: run the ${batch.length} setImmediate callback(s) queued before this phase started. Immediates queued now wait for the next iteration.`, `check phase: shu phase boshlanishidan oldin navbatga qoʻyilgan ${batch.length} ta setImmediate callback bajariladi. Hozir qoʻshilganlari keyingi iteratsiyani kutadi.`);
        for (const j of batch) {
          runJob(j, "immediate");
          drainNode();
        }
      }
      if (!timers.length && !immediates.length && !pendingIo.length && !readyIo.length) break;
    }
  }

  st.phase = null;
  if (budgetHit) {
    rec.steps.push({
      state: structuredClone({ ...st }),
      note: { en: "Stopped: the step limit was reached (the program keeps scheduling work).", uz: "Toʻxtatildi: qadamlar chegarasiga yetildi (dastur ish rejalashtirishda davom etmoqda)." },
    });
  } else {
    sync();
    rec.push(st, undefined, `Nothing left to run. Final output: ${st.console.join(" ") || "(none)"}.`, `Bajariladigan narsa qolmadi. Yakuniy output: ${st.console.join(" ") || "(yoʻq)"}.`);
  }
  return rec.steps;
}

export function finalOutput(program: Program): string[] {
  const steps = eventLoopSteps(program);
  return steps[steps.length - 1].state.console;
}

export const browserPresets = [
  {
    label: "setTimeout vs Promise",
    input: `console.log("A");
setTimeout(() => console.log("B"), 0);
Promise.resolve().then(() => console.log("C"));
console.log("D");`,
  },
  {
    label: "async/await",
    input: `async function f() {
  console.log("2");
  await null;
  console.log("4");
}
console.log("1");
f();
Promise.resolve().then(() => console.log("5"));
console.log("3");`,
  },
  {
    label: "microtask inside a task",
    input: `setTimeout(() => {
  console.log("T1");
  Promise.resolve().then(() => console.log("M2"));
}, 0);
setTimeout(() => console.log("T2"), 0);
queueMicrotask(() => console.log("M1"));`,
  },
  {
    label: "resolve() later",
    input: `new Promise((resolve) => {
  console.log("executor");
  setTimeout(() => resolve(), 0);
}).then(() => console.log("then"));
setTimeout(() => console.log("timeout"), 0);
console.log("sync");`,
  },
  {
    label: ".then chain",
    input: `Promise.resolve()
  .then(() => console.log("a1"))
  .then(() => console.log("a2"));
Promise.resolve()
  .then(() => console.log("b1"))
  .then(() => console.log("b2"));`,
  },
];

export const nodePresets = [
  {
    label: "nextTick vs promise",
    input: `Promise.resolve().then(() => console.log("promise"));
process.nextTick(() => console.log("nextTick"));
setImmediate(() => console.log("immediate"));
setTimeout(() => console.log("timeout"), 0);
console.log("sync");`,
  },
  {
    label: "inside an I/O callback",
    input: `fs.readFile(__filename, () => {
  setTimeout(() => console.log("timeout"), 0);
  setImmediate(() => console.log("immediate"));
  process.nextTick(() => console.log("nextTick"));
});`,
  },
  {
    label: "microtasks between timers",
    input: `setTimeout(() => {
  console.log("t1");
  Promise.resolve().then(() => console.log("p1"));
}, 0);
setTimeout(() => console.log("t2"), 0);`,
  },
];
