# Under the Hood

An interactive, animated learning platform for senior / FAANG interview preparation, in Uzbek and English. It explains **mechanisms**: every key algorithm and runtime concept has a step-by-step visualizer with code-line highlighting and a uz/en explanation for each step.

The full brief is in [`TASK.md`](./TASK.md); architecture and decisions are in [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md).

## What's inside

- **76 lessons × 2 languages**, in 9 sections: Start, DSA (23), JavaScript (10), TypeScript (8), React (8), Next.js (6), Node.js (7), System Design (9), Interview (4). All code is JavaScript/TypeScript, and the "modern" lessons (ES2023–ES2027, TypeScript 6/7, React 19, Node 24) are checked against current official sources.
- **~40 visualizers** (sliding window, binary search, heaps, graphs, Dijkstra, Kruskal, DP tables, the event loop for both browser and Node, closures, GC, the prototype chain, hidden classes, reconciliation, hooks, backpressure, the libuv thread pool, a JS promise pool, LRU, consistent hashing, token bucket, load balancing…). Each has play/pause/step/speed/scrubber controls and accepts validated user input.
- **Handbook** (one "Handbook" menu in the header): **Principles** (24, animated), **Architecture** (16 styles from Feature-Sliced Design to sagas, each with a scene animation), **Git** (16 topics with animated commit graphs and an "I want to…" cheat sheet) and **Tools** (51 frontend tools in 12 categories — what each is for, when to use it and when not, install command and a link to its official docs, plus examples per category). Tool links and versions were checked on 2026-10-24 (`TOOLS_CHECKED` in `src/content/tools/registry.ts`).
- In every lesson: TL;DR, visual model, mechanism, code, when to use / not, trade-offs, senior nuance, interview questions (`<QA>`), an exercise (`<Quiz>`) and resources.
- **TypeScript type puzzles** checked by the real TypeScript compiler on the server (Server Action).
- **Cmd/Ctrl + K** search, **progress tracking** and a **spaced-repetition review list** (1/3/7/16/35 days, stored in `localStorage`), a hover **glossary**, and a **resources** page backed by `resources.json` (only verified links, each with `lastVerified`).
- Every lesson opens with an "In plain words" analogy (`src/content/plain.ts`) and a sticky tab bar of its parts.
- Uzbek is the default language (`/` → `/uz`, no browser-language guessing); English at `/en`.
- Dark/light theme in OKLCH colours tuned for long reading, Poppins for text and JetBrains Mono for code, mobile layout, keyboard navigation, and `prefers-reduced-motion` support.

## Deploy (Vercel)

1. Import the repository in Vercel. Name the project **`underthehood-uz`** so the site is served at `https://underthehood-uz.vercel.app` — the same name as the logo and title (that subdomain was unused when checked on 2026-10-17).
2. If you attach a custom domain later (for example `underthehood.uz`), set `NEXT_PUBLIC_SITE_URL` to it in Project → Settings → Environment Variables and redeploy. Canonical URLs, hreflang, the sitemap, robots.txt, Open Graph images and JSON-LD all read it from `src/lib/site.ts`.
3. After the first deploy, submit `https://<your-domain>/sitemap.xml` in Google Search Console.

## Brand

- Logo: a lid lifted over `< >` — looking under the hood of code. Source of truth: `src/components/Logo.tsx`; the same paths are in `src/app/icon.svg` (favicon), `src/app/favicon.ico` (16/32/48 px), `src/app/apple-icon.png` (180 px) and the Open Graph images (`src/lib/og.tsx`).
- Fonts: Poppins (SIL OFL, files for OG images in `src/assets/fonts`) and JetBrains Mono, both loaded via `next/font`.
- Colours: OKLCH tokens in `src/app/globals.css` (`--bg`, `--fg`, `--accent`, …). Body text is ≈13:1 contrast in both themes; muted text ≥ 6:1.

## Run

Requires Node.js 20.9+ (developed on Node 24).

```bash
npm install
npm run dev              # http://localhost:3000 → redirects to /uz or /en
npm run build            # production build (prerenders every locale/section/lesson)
npm start                # serve the build
```

## Checks

```bash
npm run lint             # ESLint (next config, react-hooks rules)
npm run typecheck        # next typegen + tsc --noEmit (strict, no `any`)
npm test                 # Vitest: every step generator, parsers, type-puzzle checker
npm run check:content    # every lesson exists in both locales, compiles, uses known glossary ids,
                         # and en/uz use the same components (equal depth)
npm run verify:resources # HEAD/GET every URL in resources.json
npm run smoke -- http://localhost:3000   # e2e smoke against a running server: every page and lesson → 200, correct <html lang>
```

## Adding a lesson

1. Register it in `src/content/registry.ts` under its section — one row: `["slug", "Title EN", "Title UZ", "Summary EN", "Summary UZ"]`.
2. Create `src/content/lessons/<section>/<slug>/en.mdx` and `uz.mdx`. Don't add an `h1`; the page renders the title. Use these `##` headings in order: TL;DR → Visual model → Mechanism → Code → When to use / not → Trade-offs → Senior nuance → Interview questions → Exercise → Resources.
3. Components available without importing: `<Term id="…" />`, `<Callout kind="note|tip|warning|unverified">`, `<QA q="…" level="mid|senior">…</QA>`, `<Quiz questions={[…]} />`, `<FlowDiagram …/>`, `<DecisionTree …/>`, `<ComplexityChart …/>`, `<TypePuzzle id="…" />`, `<Resources topic="section/slug" />`. Visualizers are available the same way (`<LruViz />`) — don't `import` anything inside MDX: client components imported inside a lesson file break Next's instant-navigation validation ("module factory is not available").
4. Use `kind="unverified"` (shown as "tekshirish kerak") for any claim you couldn't confirm in official docs.
5. MDX pitfalls: never put raw `<`, `{` or `}` in prose. Wrap them in backticks, and avoid `|` inside table cells.
6. Run `npm run check:content`.

## Adding a visualizer

1. Write a pure generator in `src/visualizer/algorithms/<name>.ts`: `parseX(raw) → ParseResult<Input>` (with uz/en error messages), `xSteps(input) → Step<State>[]` using `recorder()`, and an `xCode` string whose lines the steps highlight.
2. Add tests next to the other generator tests (`linear.test.ts`, `nonlinear.test.ts`, `runtime.test.ts`): final state, step invariants, and parser errors.
3. Add a client component `src/components/visualizer/viz/XViz.tsx` that passes `code/defaultInput/parse/generate/render` to `<Visualizer>` and renders the state with primitives from `src/components/visualizer/primitives`.
4. Register it: one `dynamic()` line in `src/components/visualizer/viz/lazy.tsx` (its own chunk, downloaded only by pages that render it) and the name in `src/mdx-components.tsx`. Then use `<XViz />` in MDX.

## Adding a handbook page

- **Principle, architecture style or git topic** — these are "libraries" (`src/content/library.ts`) sharing one set of routes, components and checks. Add a `p("category", "slug", …)` row to `src/content/<principles|architecture|git>/registry.ts`, write `<slug>/en.mdx` and `uz.mdx` (with `<PrincipleViz|ArchitectureViz|GitViz id="slug" />`), and add a scene with the same slug to `src/visualizer/<principles/scenes|architecture/scenes.ts|git/scenes.ts>`. `npm test` checks every scene stays on stage without overlapping boxes; `npm run check:content` checks both languages.
- **Tool** — a `t(…)` row in `src/content/tools/registry.ts` (official docs URL only, opened and verified first); each category's examples live in `src/content/tools/<category>/{en,uz}.mdx`.

## Adding a glossary term, resource, or UI string

- **Glossary**: `src/content/glossary.ts`: `id: g("term", "English definition", "Uzbek definition")`. The term itself stays in English in both locales.
- **Resource**: add an entry to `resources.json` (`id, title, url, kind, access, level, language, topics, lastVerified`) only after opening the URL yourself, then run `npm run verify:resources`.
- **UI strings**: add them to both `src/messages/en.json` and `src/messages/uz.json` with identical keys. `en.json` is the type source, so a missing key is a type error.
- **Uzbek text**: keep technical terms in English (closure, event loop, reconciliation…) and use `ʻ` (U+02BB) in oʻ / gʻ.
- **New locale**: add it to `routing.locales` in `src/i18n/routing.ts` and create `src/messages/<locale>.json`. Then add the locale to each `Record<Locale, string>` in the registry, glossary and visualizers (TypeScript lists every spot), and add `<locale>.mdx` to each lesson.
