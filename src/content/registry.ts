import type { Locale } from "@/i18n/routing";

/**
 * Single source of truth for the course map. Lesson bodies live in
 * `src/content/lessons/<section>/<lesson>/<locale>.mdx`; this file only holds
 * what navigation, search and progress need without loading MDX.
 */

export const sectionSlugs = [
  "start",
  "dsa",
  "javascript",
  "typescript",
  "react",
  "nextjs",
  "nodejs",
  "system-design",
  "interview",
] as const;

export type SectionSlug = (typeof sectionSlugs)[number];

export interface LessonMeta {
  slug: string;
  title: Record<Locale, string>;
  summary: Record<Locale, string>;
}

type Row = [slug: string, titleEn: string, titleUz: string, summaryEn: string, summaryUz: string];

const rows = (list: Row[]): LessonMeta[] =>
  list.map(([slug, titleEn, titleUz, summaryEn, summaryUz]) => ({
    slug,
    title: { en: titleEn, uz: titleUz },
    summary: { en: summaryEn, uz: summaryUz },
  }));

export const lessons: Record<SectionSlug, LessonMeta[]> = {
  start: rows([
    ["how-to-learn", "How to learn on this platform", "Bu platformada qanday oʻqish kerak", "The lesson structure, the step-by-step visualizer and how to turn reading into interview-ready recall.", "Dars tuzilishi, step-by-step visualizer va oʻqiganingizni interview'da eslab qoladigan bilimga aylantirish."],
  ]),
  dsa: rows([
    ["big-o", "Big-O intuition & amortized analysis", "Big-O intuition va amortized analysis", "Why n log n is the sorting barrier, how to estimate from constraints, and why a doubling array is O(1) amortized.", "Nega n log n saralash chegarasi, constraint'lardan qanday baholash va nega ikki baravar oʻsuvchi array amortized O(1)."],
    ["js-toolkit", "JavaScript Toolkit for Coding Interviews", "Coding interview uchun JavaScript asboblari", "The JS-specific details interviews punish: sort comparators, number limits, Map vs object, and writing your own heap and deque.", "Interview'da jazolanadigan JS tafsilotlari: sort comparator, son chegaralari, Map va object, oʻz heap va deque'ingizni yozish."],
    ["arrays-hashing", "Arrays & Hashing", "Arrays va Hashing", "Hash map internals (buckets, load factor, collisions), frequency counting and the signals that say “use a set”.", "Hash map ichidan (bucket'lar, load factor, collision'lar), chastota sanash va “set ishlating” degan signallar."],
    ["prefix-sum", "Prefix Sum", "Prefix Sum", "O(1) range sums, and prefix sums + hash map for subarray-sum problems that sliding window cannot solve.", "O(1) oraliq yigʻindilari, va sliding window yecha olmaydigan subarray-sum masalalari uchun prefix sum + hash map."],
    ["two-pointers", "Two Pointers", "Two Pointers", "Opposite-end and same-direction pointers: the elimination argument behind O(n).", "Qarama-qarshi uchlardan va bir yoʻnalishdagi pointer'lar: O(n) ortidagi chiqarib tashlash dalili."],
    ["sliding-window", "Sliding Window", "Sliding Window", "Fixed and variable windows over arrays and strings: invariants, shrink conditions, O(n) proofs.", "Array va string ustida fixed va variable window: invariant'lar, qisqartirish sharti, O(n) isboti."],
    ["binary-search", "Binary Search", "Binary Search", "Loop invariants, lower/upper bound, and binary search on the answer.", "Loop invariant'lar, lower/upper bound va binary search on answer."],
    ["monotonic-stack", "Monotonic Stack & Queue", "Monotonic Stack va Queue", "Next greater element, histogram areas and sliding-window maximum in O(n).", "Next greater element, histogram maydoni va sliding-window maximum O(n) da."],
    ["linked-list", "Linked Lists", "Linked List'lar", "In-place reversal, fast/slow pointers, cycle detection and the dummy-head trick.", "Joyida teskari qilish, fast/slow pointer'lar, cycle aniqlash va dummy-head hiylasi."],
    ["trees", "Trees: DFS, BFS, BST, LCA", "Daraxtlar: DFS, BFS, BST, LCA", "Traversal orders, recursion as a call stack, BST invariants, lowest common ancestor and serialization.", "Aylanib chiqish tartiblari, call stack sifatida recursion, BST invariant'lari, LCA va serialization."],
    ["heap", "Heaps, Top-K & Two Heaps", "Heap'lar, Top-K va Two Heaps", "How a binary heap lives in an array, why Top-K is O(n log k), and the running-median pattern.", "Binary heap array'da qanday yashaydi, nega Top-K O(n log k), va running median pattern'i."],
    ["intervals", "Intervals & Sweep Line", "Interval'lar va Sweep Line", "Sort-then-scan merging, insertion, and counting overlaps with a sweep line.", "Saralab, keyin skanerlab birlashtirish, qoʻshish va sweep line bilan kesishuvlarni sanash."],
    ["graph-bfs-dfs", "Graphs: BFS & DFS", "Graph'lar: BFS va DFS", "Traversal order, visited sets, shortest paths in unweighted graphs, recursion vs explicit stack.", "Aylanib chiqish tartibi, visited set, vaznsiz graph'da eng qisqa yoʻl, recursion va explicit stack."],
    ["topological-sort", "Topological Sort", "Topological Sort", "Kahn's algorithm vs DFS finish order, and cycle detection in dependency graphs.", "Kahn algoritmi va DFS tugash tartibi, dependency graph'larda cycle aniqlash."],
    ["union-find", "Union-Find (DSU)", "Union-Find (DSU)", "Path compression, union by rank, α(n) amortized cost and connectivity problems.", "Path compression, union by rank, α(n) amortized narx va bogʻlanganlik masalalari."],
    ["shortest-paths", "Shortest Paths: Dijkstra, Bellman-Ford, 0-1 BFS", "Eng qisqa yoʻllar: Dijkstra, Bellman-Ford, 0-1 BFS", "Why Dijkstra needs non-negative weights, lazy deletion, and what to use when it does not apply.", "Nega Dijkstra'ga manfiy boʻlmagan vaznlar kerak, lazy deletion, va u ishlamaganda nima ishlatish kerak."],
    ["mst", "Minimum Spanning Trees", "Minimum Spanning Tree'lar", "The cut property, Kruskal with union-find, and Prim with a heap.", "Cut property, union-find bilan Kruskal va heap bilan Prim."],
    ["backtracking", "Backtracking", "Backtracking", "Choose / explore / un-choose, pruning, and the state-space tree behind subsets, permutations and N-Queens.", "Tanlash / chuqurlash / bekor qilish, pruning, va subset, permutation, N-Queens ortidagi state-space daraxti."],
    ["dynamic-programming", "Dynamic Programming", "Dynamic Programming", "States and transitions: 1D, 2D, knapsack, LIS, LCS, interval, bitmask and state-machine DP.", "Holatlar va oʻtishlar: 1D, 2D, knapsack, LIS, LCS, interval, bitmask va state-machine DP."],
    ["trie", "Trie", "Trie", "Prefix trees for autocomplete and word search; memory trade-offs vs hash sets.", "Autocomplete va soʻz qidirish uchun prefix daraxtlari; hash set bilan xotira trade-off'lari."],
    ["segment-fenwick", "Segment Tree & Fenwick Tree", "Segment Tree va Fenwick Tree", "Range queries with point updates in O(log n): lowbit arithmetic and segment decomposition.", "Nuqtaviy yangilanish bilan O(log n) da oraliq soʻrovlari: lowbit arifmetikasi va segment boʻlinishi."],
    ["bit-manipulation", "Bit Manipulation", "Bit Manipulation", "Two's complement, masks, x & (x−1), XOR tricks and subset enumeration.", "Two's complement, mask'lar, x & (x−1), XOR hiylalari va subset'larni sanab chiqish."],
    ["greedy", "Greedy Algorithms", "Greedy algoritmlar", "When a local choice is provably safe: exchange arguments, interval scheduling, jump game.", "Lokal tanlov qachon isbotli xavfsiz: exchange argument, interval scheduling, jump game."],
  ]),
  javascript: rows([
    ["event-loop", "The Event Loop", "Event Loop", "Call stack, task queue, microtask queue and rendering steps — predict the output order.", "Call stack, task queue, microtask queue va rendering qadamlari — natija tartibini oldindan ayting."],
    ["execution-context-closures", "Execution Contexts, Scope & Closures", "Execution context, scope va closure'lar", "Lexical environments, the [[Environment]] slot, hoisting, TDZ and how closures retain memory.", "Lexical environment'lar, [[Environment]] sloti, hoisting, TDZ va closure'lar xotirani qanday ushlab turadi."],
    ["this-prototypes", "this, Prototypes & Classes", "this, Prototype'lar va Class'lar", "The four this-binding rules, the [[Prototype]] chain and what class syntax compiles to.", "this binding'ning toʻrt qoidasi, [[Prototype]] zanjiri va class sintaksisi nimaga aylanadi."],
    ["memory-gc", "Memory Management & Garbage Collection", "Memory management va Garbage Collection", "Reachability, mark-and-sweep, generational GC in V8 and the common leak patterns.", "Reachability, mark-and-sweep, V8'dagi generational GC va keng tarqalgan leak pattern'lari."],
    ["v8-internals", "V8 Internals: Hidden Classes & Inline Caches", "V8 ichidan: Hidden Class'lar va Inline Cache'lar", "Shapes, transition trees, monomorphic vs megamorphic call sites, and the JIT pipeline.", "Shape'lar, transition daraxtlari, monomorphic va megamorphic call site'lar, va JIT pipeline."],
    ["iterators-generators", "Iterators, Generators & Async Iteration", "Iterator'lar, Generator'lar va Async Iteration", "The iteration protocol, generators as resumable functions, and for await…of over streams.", "Iteration protokoli, davom ettiriladigan funksiya sifatida generator'lar va stream'lar ustida for await…of."],
    ["proxy-reflect-weak", "Proxy, Reflect, WeakMap & WeakRef", "Proxy, Reflect, WeakMap va WeakRef", "Meta-programming traps and invariants, and weak references that do not keep objects alive.", "Meta-programming trap'lari va invariant'lari, obyektni tirik ushlab turmaydigan weak reference'lar."],
    ["modules-equality-coercion", "Modules, Equality & Coercion", "Modullar, Equality va Coercion", "ESM vs CommonJS (live bindings, cycles, loading), ==/===/Object.is and the coercion rules that are actually asked.", "ESM va CommonJS (live binding'lar, cycle'lar, yuklash), ==/===/Object.is va haqiqatan soʻraladigan coercion qoidalari."],
    ["async-patterns", "Async Patterns: Cancellation, Concurrency & Retries", "Async pattern'lar: bekor qilish, parallellik va retry'lar", "Promise combinators, AbortSignal, limiting concurrency with a promise pool, timeouts and retries with backoff.", "Promise kombinatorlari, AbortSignal, promise pool bilan parallellikni cheklash, timeout va backoff bilan retry'lar."],
    ["modern-javascript", "Modern JavaScript: ES2023–ES2026", "Zamonaviy JavaScript: ES2023–ES2026", "What TC39 finished recently — change-array-by-copy, groupBy, Set methods, iterator helpers, using, RegExp.escape — and what is coming (Temporal).", "TC39 yaqinda nimalarni tugatdi — change-array-by-copy, groupBy, Set metodlari, iterator helper'lar, using, RegExp.escape — va nima kelmoqda (Temporal)."],
  ]),
  typescript: rows([
    ["structural-typing-narrowing", "Structural Typing & Narrowing", "Structural typing va Narrowing", "Assignability by shape, excess property checks, control-flow narrowing and discriminated unions.", "Shakl boʻyicha assignability, excess property tekshiruvi, control-flow narrowing va discriminated union'lar."],
    ["generics-variance", "Generics, Constraints & Variance", "Generics, Constraint'lar va Variance", "Inference, constraints, and why function parameters are contravariant (and methods are bivariant).", "Inference, constraint'lar va nega funksiya parametrlari contravariant (metodlar esa bivariant)."],
    ["conditional-types", "Conditional Types & infer", "Conditional Types va infer", "extends as a type-level if, infer for pattern matching, and distribution over unions.", "Type darajasidagi if sifatida extends, pattern matching uchun infer va union'lar ustida taqsimlanish."],
    ["mapped-template-types", "Mapped & Template Literal Types", "Mapped va Template Literal Types", "Homomorphic mapped types, modifiers, key remapping with as, and string-level type programming.", "Homomorphic mapped type'lar, modifier'lar, as bilan key remapping va string darajasidagi type programming."],
    ["utility-types-from-scratch", "Utility Types From Scratch", "Utility type'larni noldan yozish", "Rebuild Pick, Omit, DeepPartial, UnionToIntersection — with live type puzzles.", "Pick, Omit, DeepPartial, UnionToIntersection'ni qayta yozish — jonli type puzzle'lar bilan."],
    ["branded-satisfies-const", "Branded Types, satisfies & const Type Parameters", "Branded type'lar, satisfies va const type parametrlari", "Nominal typing on a structural system, validating without widening, and preserving literal types.", "Structural tizimda nominal typing, kengaytirmasdan tekshirish va literal type'larni saqlash."],
    ["type-level-limits", "Type-Level Programming: Limits & When to Stop", "Type-level programming: chegaralar va qachon toʻxtash kerak", "Recursion limits, compile-time cost, error-message quality and the maintainability line.", "Recursion chegaralari, compile-time narxi, xato xabarlari sifati va maintainability chegarasi."],
    ["modern-typescript", "TypeScript 6 & 7: What Changed", "TypeScript 6 va 7: nima oʻzgardi", "New defaults (strict, esnext), removed options, the native Go compiler in TS 7, and running .ts directly in Node with type stripping.", "Yangi standartlar (strict, esnext), olib tashlangan opsiyalar, TS 7'dagi native Go kompilyatori va type stripping bilan .ts'ni Node'da toʻgʻridan-toʻgʻri ishga tushirish."],
  ]),
  react: rows([
    ["rendering-reconciliation", "Rendering & Reconciliation", "Rendering va Reconciliation", "Why components re-render, render vs commit, keys and how React diffs the tree.", "Komponentlar nega re-render boʻladi, render va commit, key'lar va React daraxtni qanday solishtiradi."],
    ["fiber-architecture", "Fiber Architecture", "Fiber arxitekturasi", "Fibers as units of work, the work loop, double buffering, lanes and interruptible rendering.", "Ish birligi sifatida fiber'lar, work loop, double buffering, lane'lar va toʻxtatiladigan rendering."],
    ["hooks-internals", "Hooks Internals & Effects", "Hook'lar ichidan va Effect'lar", "The hook list, effect lifecycle, cleanup timing and the stale-closure problem.", "Hook roʻyxati, effect lifecycle, cleanup vaqti va stale closure muammosi."],
    ["memoization-compiler", "Memoization & the React Compiler", "Memoization va React Compiler", "memo, useMemo, useCallback — when they help, when they hurt, and what the compiler automates.", "memo, useMemo, useCallback — qachon foyda, qachon zarar, va compiler nimani avtomatlashtiradi."],
    ["concurrent-suspense", "Concurrent Rendering, Transitions & Suspense", "Concurrent rendering, Transition'lar va Suspense", "Interruptible renders, priorities, useTransition, useDeferredValue and Suspense boundaries.", "Toʻxtatiladigan render'lar, ustuvorliklar, useTransition, useDeferredValue va Suspense chegaralari."],
    ["server-components", "Server Components vs Client Components", "Server Components va Client Components", "What runs where, the 'use client' boundary, serializable props and the RSC payload.", "Nima qayerda ishlaydi, 'use client' chegarasi, serializable props va RSC payload."],
    ["state-performance", "State Management & Performance Profiling", "State management va performance profiling", "Where state should live, context vs external stores, and measuring with the Profiler.", "State qayerda yashashi kerak, context va tashqi store'lar, va Profiler bilan oʻlchash."],
    ["react-19-actions", "React 19: Actions, use() & New Hooks", "React 19: Action'lar, use() va yangi hook'lar", "useActionState, useOptimistic, form actions, use(), ref as a prop, and useEffectEvent from React 19.2.", "useActionState, useOptimistic, form action'lar, use(), prop sifatida ref va React 19.2'dagi useEffectEvent."],
  ]),
  nextjs: rows([
    ["app-router-architecture", "App Router Architecture", "App Router arxitekturasi", "Segments, layouts, templates, loading/error boundaries, parallel and intercepting routes.", "Segment'lar, layout'lar, template'lar, loading/error chegaralari, parallel va intercepting route'lar."],
    ["rendering-strategies", "Rendering Strategies", "Rendering strategiyalari", "Static shells, dynamic holes, streaming and revalidation — a decision tree for Next.js 16.", "Static shell'lar, dynamic boʻshliqlar, streaming va revalidation — Next.js 16 uchun qaror daraxti."],
    ["rsc-hydration", "RSC Payload & Hydration", "RSC payload va Hydration", "What the server sends, how the client reconstructs the tree, and what hydration actually does.", "Server nima yuboradi, client daraxtni qanday tiklaydi va hydration aslida nima qiladi."],
    ["caching", "Caching in Next.js 16", "Next.js 16'da caching", "Cache Components, 'use cache', cacheLife/cacheTag, revalidation and the client router cache.", "Cache Components, 'use cache', cacheLife/cacheTag, revalidation va client router cache."],
    ["server-actions-proxy-runtime", "Server Actions, Proxy & Runtimes", "Server Action'lar, Proxy va Runtime'lar", "Mutations over RPC, security of actions, the proxy file (ex-middleware) and Node vs Edge.", "RPC orqali mutatsiyalar, action'lar xavfsizligi, proxy fayli (sobiq middleware) va Node va Edge."],
    ["production-problems", "Production Problems", "Production muammolari", "Hydration mismatches, bundle bloat, request waterfalls and how to diagnose each.", "Hydration mismatch'lar, bundle shishishi, request waterfall'lar va ularning har birini aniqlash."],
  ]),
  nodejs: rows([
    ["event-loop-phases", "Node.js Event Loop Phases", "Node.js event loop phase'lari", "timers → poll → check, nextTick vs microtasks, and how Node differs from the browser.", "timers → poll → check, nextTick va microtask'lar, va Node brauzerdan qanday farq qiladi."],
    ["libuv-thread-pool", "libuv & the Thread Pool", "libuv va Thread Pool", "Which operations use the 4-thread pool, which use the OS, and how pool starvation happens.", "Qaysi amallar 4 thread'li pool'dan foydalanadi, qaysilari OS'dan, va pool qanday tiqilib qoladi."],
    ["streams-backpressure", "Streams & Backpressure", "Streams va Backpressure", "Readable/Writable internals, highWaterMark, and what happens when the consumer is slower than the producer.", "Readable/Writable ichidan, highWaterMark va consumer producer'dan sekin boʻlganda nima sodir boʻladi."],
    ["workers-cluster-processes", "Worker Threads vs Cluster vs Child Processes", "Worker thread'lar, Cluster va Child process'lar", "Isolation, memory sharing, communication cost and when to choose each.", "Izolyatsiya, xotirani boʻlishish, aloqa narxi va har birini qachon tanlash kerak."],
    ["memory-profiling", "Memory Leaks & Profiling", "Memory leak'lar va profiling", "Heap snapshots, allocation timelines, CPU profiles and the usual leak suspects.", "Heap snapshot'lar, allocation timeline'lar, CPU profillar va odatiy leak gumondorlari."],
    ["errors-shutdown-security", "Errors, Graceful Shutdown & Security", "Xatolar, Graceful Shutdown va Xavfsizlik", "Operational vs programmer errors, SIGTERM handling, injection, prototype pollution and supply chain.", "Operational va programmer xatolari, SIGTERM'ni qayta ishlash, injection, prototype pollution va supply chain."],
    ["modern-node", "Modern Node.js Toolbox", "Zamonaviy Node.js asboblari", "Built-in test runner, --watch, --env-file, node --run, running TypeScript, fetch and Web Streams, the permission model and require(esm).", "Oʻrnatilgan test runner, --watch, --env-file, node --run, TypeScript'ni ishga tushirish, fetch va Web Streams, permission model va require(esm)."],
  ]),
  "system-design": rows([
    ["interview-framework", "The System Design Interview Framework", "System design interview framework'i", "Requirements → estimation → high-level design → deep dive → trade-offs, with back-of-the-envelope math.", "Talablar → baholash → yuqori darajadagi dizayn → chuqur tahlil → trade-off'lar, taxminiy hisob-kitoblar bilan."],
    ["load-balancing", "Load Balancing", "Load Balancing", "L4 vs L7, algorithms, health checks, sticky sessions and removing single points of failure.", "L4 va L7, algoritmlar, health check'lar, sticky session'lar va yagona nosozlik nuqtalarini yoʻqotish."],
    ["caching", "Caching", "Caching", "Cache-aside, write-through/back, eviction, TTLs, stampedes and invalidation.", "Cache-aside, write-through/back, eviction, TTL'lar, stampede va invalidation."],
    ["sharding-replication", "Sharding & Replication", "Sharding va Replication", "Leader/follower and leaderless replication, partitioning schemes, consistent hashing and rebalancing.", "Leader/follower va leaderless replication, boʻlish sxemalari, consistent hashing va rebalancing."],
    ["consistency", "Consistency, CAP & Quorums", "Consistency, CAP va Quorum'lar", "Linearizability to eventual consistency, CAP/PACELC done right, and read/write quorums.", "Linearizability'dan eventual consistency'gacha, CAP/PACELC toʻgʻri talqini va read/write quorum'lar."],
    ["message-queues", "Message Queues & Event Streams", "Message queue'lar va Event stream'lar", "Queues vs logs, delivery guarantees, idempotency, ordering, partitions and the outbox pattern.", "Queue'lar va log'lar, yetkazish kafolatlari, idempotency, tartib, partition'lar va outbox pattern."],
    ["rate-limiting", "Rate Limiting", "Rate Limiting", "Token bucket, leaky bucket, fixed and sliding windows — and making them work across many servers.", "Token bucket, leaky bucket, fixed va sliding window'lar — va ularni koʻp serverlarda ishlatish."],
    ["frontend-system-design", "Frontend System Design", "Frontend System Design", "Component architecture, data fetching, offline, accessibility and performance budgets.", "Komponent arxitekturasi, data fetching, offline, accessibility va performance budget'lar."],
    ["url-shortener", "Worked Example: URL Shortener", "Ishlangan misol: URL qisqartiruvchi", "A full interview walkthrough: estimates, ID generation, storage, caching and analytics.", "Toʻliq interview tahlili: baholashlar, ID generatsiyasi, saqlash, caching va analitika."],
  ]),
  interview: rows([
    ["coding-interview-process", "The Coding Interview Process", "Coding interview jarayoni", "Clarify, plan, code, test — and how to think out loud so the interviewer can follow you.", "Aniqlashtirish, rejalashtirish, kod yozish, test qilish — va interviewer sizni kuzata olishi uchun ovoz chiqarib fikrlash."],
    ["behavioral-star", "Behavioral Interviews & STAR", "Behavioral interview'lar va STAR", "Building a story bank, the STAR structure, and what each question is really probing.", "Hikoyalar bankini yaratish, STAR tuzilishi va har bir savol aslida nimani tekshiradi."],
    ["senior-signals", "Senior-Level Signals", "Senior darajadagi signal'lar", "Ownership, scope, ambiguity, influence and impact — and how they show up in every round.", "Ownership, scope, noaniqlik, ta'sir va natija — va ular har bir raundda qanday namoyon boʻladi."],
    ["mock-interview", "Mixed Review & Mock Interview", "Aralash takrorlash va mock interview", "A cross-topic quiz and a bank of mock questions with model answers.", "Mavzular aralash quiz va namunaviy javoblari bilan mock savollar banki."],
  ]),
};

export function isSectionSlug(value: string): value is SectionSlug {
  return (sectionSlugs as readonly string[]).includes(value);
}

export function getLesson(section: SectionSlug, slug: string) {
  return lessons[section].find((lesson) => lesson.slug === slug);
}

export function readyLessonParams() {
  return sectionSlugs.flatMap((section) =>
    lessons[section]
      .map((lesson) => ({ section, lesson: lesson.slug })),
  );
}

/** All ready lessons in course order, for prev/next navigation. */
export function lessonSequence() {
  return sectionSlugs.flatMap((section) =>
    lessons[section].map((l) => ({ section, lesson: l })),
  );
}

export function neighbours(section: SectionSlug, slug: string) {
  const seq = lessonSequence();
  const i = seq.findIndex((x) => x.section === section && x.lesson.slug === slug);
  return { prev: i > 0 ? seq[i - 1] : null, next: i >= 0 && i < seq.length - 1 ? seq[i + 1] : null };
}
