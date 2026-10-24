# PROMPT: An interactive senior/FAANG-level learning platform

## Role
You are a senior frontend/fullstack engineer, technical educator and motion designer. Your task is to build a website that prepares people for interviews at FAANG and other large companies. It teaches the knowledge every senior software engineer must have in a **visual, animated, interactive** way.

## Core idea
This is not an ordinary "textbook". Every topic answers the following questions by **showing**:
- **What is it?** — Answer in one sentence, then show a visual model.
- **How does it work inside?** — A step-by-step animation with play / pause / step forward / step back / speed controls.
- **When is it used?** — Real use cases, plus the signals that reveal the pattern (e.g. "a sorted array plus a pair search → two pointers").
- **When is it not used?** — Anti-patterns and alternatives.
- **Trade-offs** — Time/space complexity, performance, DX and maintainability.
- **Senior-level nuance** — The gotchas, edge cases and bugs that show up in production.
- **How it is asked in interviews** — Typical questions, follow-up questions and what the interviewer expects.

Clichéd, shallow explanations such as "a closure is a function inside a function" are **forbidden**. Every explanation must reach the level of the mechanism. A closure, for example, is explained through the lexical environment, the [[Environment]] slot, the scope chain, memory retention and how it relates to GC.

## Language requirements
- The site is available in **Uzbek** and **English**, with a language switcher (`/uz/...` and `/en/...` in the URL).
- In the Uzbek version, technical terms are **not translated**. Words such as closure, event loop, microtask, generics, reconciliation, hydration, backpressure, sliding window and memoization stay in their original English form. Only the explanatory text is in Uzbek.
- The first time a term appears, it shows a short explanation in a hover tooltip (glossary).
- The content has the same depth in both languages. The Uzbek version must not be a "shortened translation".

## Tech stack
Use the latest stable versions. Check each version in the official documentation before writing it down; don't pin versions from memory.
- **Next.js** (App Router) + **TypeScript** (strict mode)
- **MDX** for content: every lesson is an `.mdx` file with interactive components inside
- **i18n**: `next-intl` or an equivalent solution
- **Motion** (Framer Motion) for animations; SVG + D3 for complex graphics only where needed
- **Shiki** for syntax highlighting
- **Sandpack** or similar: an editable code playground that runs in the browser
- **Tailwind CSS** for styling, with dark/light mode
- Static generation wherever possible; a backend only if necessary (progress is saved to `localStorage` first, optional auth later)

## Visualizer engine (the most important part — build it first)
All animations run on one shared engine:
- An algorithm or mechanism is written as a **pure function** that returns `Step[]`, a list of state snapshots. The animation only renders those snapshots, which keeps logic and UI separate.
- Controls: play, pause, step forward/back, speed slider, reset and a timeline scrubber.
- Next to each step, the current code line is highlighted, along with an Uzbek/English explanation of why this step happens.
- Users can enter their own input (an array, a graph or a string), and the input is validated.
- Primitive components: `ArrayView`, `PointerView`, `StackView`, `QueueView`, `TreeView`, `GraphView`, `GridView` (for DP tables), `HeapView`, `CallStackView` and `TimelineView`.
- Respect `prefers-reduced-motion`; every step stays readable even when animation is turned off.
- Every algorithm's `Step[]` generator has a unit test that checks its result equals the result of the plain algorithm.

## Content map

### 1. DSA — organized by pattern (not a list of problems)
Each pattern covers:
- the signals that let you recognise it;
- template code in TS;
- a visual;
- its complexity;
- 3–5 classic problems, with name and difficulty;
- typical mistakes.

The patterns:
- Arrays & Hashing, Prefix Sum, Two Pointers, Sliding Window (fixed/variable)
- Binary Search (including "binary search on the answer")
- Monotonic Stack / Monotonic Queue
- Linked List (fast/slow pointers, reversal)
- Trees: DFS/BFS, BST, LCA, serialization
- Heap / Priority Queue, Top-K, Two Heaps
- Intervals (merge, sweep line)
- Graphs: BFS, DFS, Topological Sort, Union-Find, Dijkstra, Bellman-Ford, MST
- Backtracking
- Dynamic Programming: 1D, 2D, knapsack, LIS, LCS, interval DP, bitmask DP and state machine DP, with the DP table filling in as an animation
- Trie, Segment Tree / Fenwick Tree
- Bit Manipulation, Greedy
- Big-O intuition: why `n log n`, with a visual of amortized analysis

### 2. JavaScript (at the mechanism level)
- Event loop: call stack, task queue, microtask queue and rendering steps. The animation shows the order of `setTimeout`, `Promise`, `queueMicrotask` and `await`, and the user enters code and predicts the output order.
- Execution context, lexical environment, closures, hoisting and the TDZ
- `this` binding rules, the prototype chain and classes from the inside
- Memory management, GC (mark-and-sweep, generational) and memory leak patterns
- V8 internals: hidden classes, inline caching, and why they affect performance
- Iterators, generators and async iterators
- Proxy/Reflect, WeakMap/WeakRef
- Module systems (ESM vs CJS), equality and coercion — only the parts that are actually asked in interviews

### 3. Advanced TypeScript
- Structural typing, type narrowing, discriminated unions
- Generics and constraints, with a visual of variance (covariance/contravariance)
- Conditional types, `infer`, distributive conditional types
- Mapped types, key remapping, template literal types
- Writing utility types from scratch (`DeepPartial`, `UnionToIntersection`, etc.)
- Branded/nominal types, `satisfies`, `const` type parameters
- The limits of type-level programming and when to stop
- Interactive "type puzzle" exercises: the user writes a type and it is checked

### 4. React
- The rendering model: render vs commit, and why a re-render happens, shown on the component tree
- Reconciliation, keys and the Fiber architecture
- Hooks from the inside: the hooks list, the `useEffect` lifecycle and the stale closure problem
- Memoization with `memo`, `useMemo` and `useCallback`: when it helps, when it hurts, and how the React Compiler changes this
- Concurrent rendering, transitions, Suspense, `useDeferredValue`
- Server Components vs Client Components, and their boundaries
- State management trade-offs and performance profiling

### 5. Next.js
- App Router architecture, layouts and route segments
- Rendering strategies (static, dynamic, streaming, ISR) as a visual decision tree
- The RSC payload and the hydration process, as an animation
- Caching layers (they depend on the version, so write them from the current documentation)
- Server Actions, middleware, edge vs Node runtime
- Production problems: hydration mismatches, bundle size, waterfalls

### 6. Node.js
- Event loop phases (timers, pending, poll, check, close) and a visual of how they differ from the browser event loop
- libuv, the thread pool, and which operations go to the thread pool
- Streams and backpressure, as an animation
- Worker threads vs cluster vs child processes
- Finding memory leaks, heap snapshots and profiling
- Error handling, graceful shutdown and security (injection, prototype pollution, dependency risk)

### 7. System Design (required for FAANG)
- Backend: load balancing, caching, sharding, replication, consistency, message queues and rate limiting, each with a visual diagram
- Frontend system design: component architecture, data fetching, offline support, accessibility, performance budgets
- The interview framework: requirements → estimation → high-level design → deep dive → trade-offs

### 8. Interview preparation
- The coding interview process: understanding the problem, thinking out loud, testing
- Behavioral (STAR) and senior-level signals: ownership, scope, impact
- A mixed quiz and "mock interview" questions at the end of each section

## Additional courses and resources section
- Each section has a "Learn more" block listing full courses, books and official documentation, each marked with free/paid, language and level.
- **Before using any link, check that it actually exists and is current.** Inventing URLs, course names or authors is strictly forbidden. Don't add a resource you couldn't verify.
- Prefer official sources (MDN, react.dev, nextjs.org, nodejs.org, typescriptlang.org).
- Store resources in a separate `resources.json` file, each with a `lastVerified` date.

## UX requirements
- Every lesson page follows this structure: TL;DR → Visual model → Mechanism (animation) → Code → When to use / not → Trade-offs → Senior nuance → Interview questions → Exercise → Resources.
- Global search (by term, pattern or problem) through a `Cmd+K` command palette.
- Progress tracking, plus a "review" list for spaced repetition.
- Animations work on mobile too (touch controls).
- Accessibility: keyboard navigation, ARIA, colour contrast and text alternatives for animations.
- Performance: Lighthouse 90+, with animation components lazy-loaded.

## Code quality
- TypeScript strict, no `any`.
- Unit tests for the visualization generators and the exercise checkers; an e2e smoke test for the main pages.
- Content and code are separate: adding a new topic means one MDX file plus, if needed, one step generator.
- The README covers the project structure, how to add a new lesson and how to add a translation.

## Stages (do them in order and stop after each stage to show the result)
1. **Skeleton**: Next.js project, i18n (uz/en), MDX pipeline, layout, navigation, dark mode.
2. **Visualizer engine**: step model, controls, primitive components, tests.
3. **MVP content (6 lessons, in both languages)**: Event Loop (JS), Sliding Window, Binary Search, Graph BFS/DFS, React Rendering & Reconciliation, Node Streams & Backpressure.
4. **Quality check**: re-review that explanations aren't shallow, that terms aren't translated and that links are real.
5. Expand the remaining sections; add quizzes and progress tracking.
6. Resources section (verified links only).
7. **Handbook** (added later): reference pages beyond the lessons, grouped under one navigation menu so the header doesn't get crowded.
   - **Frontend tools**: the tools in use today (Zod, shadcn/ui, etc.). For each: what it is, when to use it and when not to, how to install it, and a link to its **official documentation**. Keep it short and clear.
   - **Software architecture**: Feature-Sliced Design and other architecture styles, each with animations and visual explanations.
   - **Git**: the Git commands used in practice today, with visual explanations.
   - Every example, term and concept must be real and accurate at FAANG level, never made up.

## Strict rules
- Don't write an uncertain fact; mark it "needs checking".
- Check version-dependent information (APIs, caching behaviour) against the current official documentation.
- For every complex claim, explain the mechanism, not just the result.
- Before starting, show the architecture plan and folder structure, then begin with stage 1.
