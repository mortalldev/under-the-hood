# Under the Hood

An interactive, animated learning platform for senior-engineer and FAANG interview preparation, available in English and Uzbek.

It teaches **mechanisms**, not definitions. Every key algorithm and runtime concept has a step-by-step visualizer with code-line highlighting and an explanation for each step. Every architecture style and Git command has a scene animation that shows the problem first and then the fix.

- The original brief is in [`TASK.md`](./TASK.md).
- Architecture and design decisions are in [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md).

## What's inside

### Lessons: 76 lessons, each in both languages

The lessons are grouped into 9 sections:

| Section | Lessons |
| --- | --- |
| Start | — |
| DSA | 23 |
| JavaScript | 10 |
| TypeScript | 8 |
| React | 8 |
| Next.js | 6 |
| Node.js | 7 |
| System Design | 9 |
| Interview | 4 |

- All code is JavaScript or TypeScript.
- DSA is taught by **pattern**: how to recognise it, a template, a visual, complexity, classic problems and typical mistakes. It is not a list of problems.
- The lessons on modern features (ES2023–ES2027, TypeScript 6/7, React 19, Node 24) are checked against current official sources.

Every lesson follows the same structure: TL;DR → visual model → mechanism (animation) → code → when to use / when not to → trade-offs → senior nuance → interview questions → exercise → resources. Each lesson also opens with an "In plain words" analogy and has a sticky tab bar for jumping between parts.

### Visualizers: about 40

Examples include sliding window, binary search, heaps, graphs, Dijkstra, Kruskal, DP tables, union-find, tries, Fenwick trees, the event loop (browser and Node), closures, mark-and-sweep GC, the prototype chain, hidden classes, React reconciliation and the hooks list. System-level ones cover stream backpressure, the libuv thread pool, a promise pool, LRU caches, consistent hashing, token buckets and load balancing.

- Controls: play, pause, step forward/back, speed, a timeline scrubber and reset.
- Users can enter their own input, and it is validated.
- Every animation is a pure, unit-tested step generator.

### Handbook

The **Handbook** menu in the header groups four reference libraries:

| Library | Content |
| --- | --- |
| **Principles** | 24 engineering principles in 5 groups: SOLID, simplicity, module design, reliable code and clean-code practice. Each is animated. |
| **Architecture** | 16 styles at three scales, each with a scene animation (listed below). |
| **Git** | 16 topics with animated commit graphs (listed below), plus an "I want to…" cheat sheet. |
| **Tools** | 51 frontend tools in 12 categories (listed below). |

**Architecture styles, by scale:**

- **Frontend:** Feature-Sliced Design, Atomic Design, micro-frontends, monorepos, BFF.
- **Application:** layered, MVC/MVVM, hexagonal, Clean Architecture, modular monolith, DDD.
- **Distributed:** microservices, event-driven, CQRS, event sourcing, sagas.

Architecture pages have: TL;DR, the animation, how it works, real code, when to use it / when not to, a trade-off table, interview questions with answers, and sources.

**Git topics:** the object model, the three areas, branches, merge, rebase, interactive rebase (`--fixup` / `--autosquash`), cherry-pick, reset vs revert, reflog, stash, remotes (`--force-with-lease`), team workflows, bisect, worktrees, large repos (partial clone, sparse-checkout, `scalar`) and hooks. Each cheat-sheet command is marked *safe*, *local only* or *rewrites history*.

**Tool categories:** validation, UI components, styling, server state, client state, forms, frameworks, code quality, testing, monorepos, animation and performance.

- Examples include Zod, shadcn/ui, Base UI, Tailwind CSS, TanStack Query, Zustand, nuqs, React Hook Form, Vitest, Playwright, MSW, pnpm, Turborepo, Motion, web-vitals and Sentry.
- Each tool card says what the tool is, when to choose it, when not to, and how to install it, and links to its **official documentation**.
- Each category page adds code examples, a comparison and interview questions.
- The index page shows a recommended default stack.
- All tool links and facts were verified on 2026-10-24 (`TOOLS_CHECKED` in `src/content/tools/registry.ts`).

### Practice and navigation

- **TypeScript type puzzles**, checked by the real TypeScript compiler in a Server Action.
- **Cmd/Ctrl + K search** across lessons, glossary terms, principles, architecture styles, Git topics and tools.
- **Progress tracking** and a **spaced-repetition review list** (intervals of 1, 3, 7, 16 and 35 days), stored in `localStorage`.
- A **hover glossary** (143 terms). Technical terms keep their English name in both languages.
- A **resources** page backed by `resources.json`: 156 links. Each was opened and verified, and records a `lastVerified` date.

### Languages and design

- Uzbek is the default language: `/` redirects to `/uz`, with no guessing from the browser language. English is at `/en`. Both languages have the same depth of content; the Uzbek version is not a shortened translation.
- Dark and light themes use OKLCH colours tuned for long reading. Text is set in Poppins and code in JetBrains Mono.
- The layout works on phones and supports keyboard navigation.
- `prefers-reduced-motion` is respected: every step stays readable as text when animation is off.

## Tech stack

| Concern | Choice |
| --- | --- |
| Framework | Next.js 16 (App Router, Turbopack, Cache Components) |
| UI | React 19 |
| Language | TypeScript 6, `strict` |
| i18n | next-intl 4 |
| Content | MDX via `@next/mdx` |
| Code highlighting | Shiki at build time; no client JS |
| Styling | Tailwind CSS 4 with the typography plugin |
| Animation | Motion |
| Tests | Vitest, plus an HTTP smoke test |

Exact versions, and the reasons behind each choice, are in [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md).

## Project structure

```
src/
├── app/[locale]/              # every route is localized (/uz/…, /en/…)
│   ├── learn/[section]/[lesson]/      # lessons
│   ├── principles/[category]/[principle]/
│   ├── architecture/[category]/[topic]/
│   ├── git/[category]/[topic]/
│   ├── tools/[category]/
│   └── review/ resources/ glossary/
├── components/
│   ├── layout/                # header, Handbook menu, mobile menu, search, sidebar
│   ├── library/               # shared views for principles / architecture / git
│   ├── tools/                 # tool cards and sidebar
│   ├── mdx/                   # Term, Callout, QA, Quiz, diagrams…
│   ├── progress/              # progress and review list
│   └── visualizer/            # the player, primitives/, viz/<Name>Viz.tsx
├── content/
│   ├── registry.ts            # course map: sections → lessons
│   ├── library.ts             # shared model for the handbook libraries
│   ├── lessons/<section>/<slug>/{en,uz}.mdx
│   ├── principles/ architecture/ git/   # registry.ts + <slug>/{en,uz}.mdx
│   ├── tools/                 # registry.ts (51 tools) + <category>/{en,uz}.mdx
│   └── glossary.ts, puzzles.ts, resources.ts, plain.ts
├── visualizer/                # framework-agnostic engine (no React)
│   ├── core/                  # Step model, recorder, input parsing, layout
│   ├── algorithms/            # pure step generators + tests
│   └── principles/ architecture/ git/   # scene definitions for the handbook animations
├── messages/{en,uz}.json      # UI strings (identical keys, type-checked)
└── mdx-components.tsx         # components available in every MDX file
resources.json                 # verified links with lastVerified dates
scripts/                       # check-content, verify-resources, smoke
```

## Run

Requires Node.js 20.9 or later (developed on Node 24).

```bash
npm install
npm run dev              # http://localhost:3000 → redirects to /uz
npm run build            # production build (prerenders every locale and page)
npm start                # serve the build
```

## Checks

```bash
npm run lint             # ESLint (Next config, react-hooks rules)
npm run typecheck        # next typegen + tsc --noEmit (strict, no `any`)
npm test                 # Vitest: step generators, handbook scenes, parsers, type-puzzle checker
npm run check:content    # every lesson and handbook page exists in both locales, compiles,
                         # uses known glossary ids, and uses the same components in en and uz
npm run verify:resources # HEAD/GET every URL in resources.json
npm run smoke -- http://localhost:3000   # e2e smoke test against a running server:
                                         # every page returns 200 with the correct <html lang>
```

## Deploy (Vercel)

1. Import the repository in Vercel. Name the project **`underthehood-uz`** so the site is served at `https://underthehood-uz.vercel.app`. This matches the logo and title, and the subdomain was unused when checked on 2026-10-17.
2. If you later attach a custom domain (for example `underthehood.uz`), set `NEXT_PUBLIC_SITE_URL` to it under Project → Settings → Environment Variables, then redeploy. Canonical URLs, hreflang, the sitemap, robots.txt, Open Graph images and JSON-LD all read the domain from `src/lib/site.ts`.
3. After the first deploy, submit `https://<your-domain>/sitemap.xml` in Google Search Console.

## Contributing content

### Adding a lesson

1. Register the lesson in `src/content/registry.ts` under its section. It is one row:
   ```ts
   ["slug", "Title EN", "Title UZ", "Summary EN", "Summary UZ"]
   ```
2. Create `src/content/lessons/<section>/<slug>/en.mdx` and `uz.mdx`.
   - Don't add an `h1`; the page renders the title.
   - Use these `##` headings, in this order: TL;DR → Visual model → Mechanism → Code → When to use / not → Trade-offs → Senior nuance → Interview questions → Exercise → Resources.
3. Use the shared components directly. They are available without importing:
   - `<Term id="…" />`
   - `<Callout kind="note|tip|warning|unverified">`
   - `<QA q="…" level="mid|senior">…</QA>`
   - `<Quiz questions={[…]} />`
   - `<FlowDiagram …/>`, `<DecisionTree …/>`, `<ComplexityChart …/>`
   - `<TypePuzzle id="…" />`, `<Resources topic="section/slug" />`
   - Any visualizer, for example `<LruViz />`

   Don't `import` anything inside an MDX file. A client component imported inside a lesson breaks Next's instant-navigation validation with "module factory is not available".
4. Mark any claim you couldn't confirm in official docs with `kind="unverified"`. Readers see it as a rose-coloured callout marked with "?".
5. Avoid these MDX pitfalls:
   - Never put a raw `<`, `{` or `}` in prose. Wrap it in backticks.
   - Avoid `|` inside table cells.
6. Run `npm run check:content`.

### Adding a visualizer

1. Write a pure generator in `src/visualizer/algorithms/<name>.ts`. It exports three things:
   - `parseX(raw) → ParseResult<Input>`, with error messages in both languages.
   - `xSteps(input) → Step<State>[]`, built with `recorder()`.
   - An `xCode` string whose lines the steps highlight.
2. Add tests next to the other generator tests (`linear.test.ts`, `nonlinear.test.ts`, `runtime.test.ts`). Cover the final state, the step invariants and the parser errors.
3. Add a client component `src/components/visualizer/viz/XViz.tsx`.
   - Pass `code`, `defaultInput`, `parse`, `generate` and `render` to `<Visualizer>`.
   - Render the state with the primitives in `src/components/visualizer/primitives`.
4. Register the component:
   - Add one `dynamic()` line in `src/components/visualizer/viz/lazy.tsx`. This gives it its own chunk, downloaded only by pages that use it.
   - Add its name to `src/mdx-components.tsx`.

   Then use `<XViz />` in MDX.

### Adding a handbook page

**A principle, architecture style or Git topic.** These three are "libraries" (`src/content/library.ts`) that share one set of routes, components and checks.

1. Add a `p("category", "slug", …)` row to `src/content/<principles|architecture|git>/registry.ts`.
2. Write `<slug>/en.mdx` and `uz.mdx` next to that registry. Include the matching animation: `<PrincipleViz id="slug" />`, `<ArchitectureViz id="slug" />` or `<GitViz id="slug" />`.
3. Add a scene with the same slug to the library's `scenes.ts` in `src/visualizer/<library>/`.

`npm test` checks that every scene stays on stage with no overlapping boxes. `npm run check:content` checks both languages.

**A tool.** Add a `t(…)` row to `src/content/tools/registry.ts`. Link only to the official docs URL, and open and verify it first. Each category's examples live in `src/content/tools/<category>/{en,uz}.mdx`.

### Adding a glossary term, resource or UI string

- **Glossary term:** add `id: g("term", "English definition", "Uzbek definition")` to `src/content/glossary.ts`. The term itself stays in English in both locales.
- **Resource:** open the URL yourself first. Then add an entry to `resources.json` (`id, title, url, kind, access, level, language, topics, lastVerified`) and run `npm run verify:resources`.
- **UI string:** add it to both `src/messages/en.json` and `src/messages/uz.json` with identical keys. `en.json` is the type source, so a missing key is a type error.
- **Uzbek text:** keep technical terms in English (closure, event loop, reconciliation…). Write oʻ and gʻ with `ʻ` (U+02BB).
- **New locale:**
  1. Add it to `routing.locales` in `src/i18n/routing.ts` and create `src/messages/<locale>.json`.
  2. Add the locale to each `Record<Locale, string>` in the registries, glossary and visualizers. TypeScript lists every place that needs it.
  3. Add a `<locale>.mdx` file to each lesson and handbook page.

## Brand

- **Logo:** a lid lifted over `< >`, i.e. looking under the hood of code.
  - The source of truth is `src/components/Logo.tsx`.
  - The same paths are used in `src/app/icon.svg` (favicon), `src/app/favicon.ico` (16/32/48 px), `src/app/apple-icon.png` (180 px) and the Open Graph images (`src/lib/og.tsx`).
- **Fonts:** Poppins and JetBrains Mono, both loaded through `next/font`. Poppins is licensed under SIL OFL; the files used for OG images are in `src/assets/fonts`.
- **Colours:** OKLCH tokens in `src/app/globals.css` (`--bg`, `--fg`, `--accent`, …). Body text has about 13:1 contrast in both themes; muted text is at least 6:1.
