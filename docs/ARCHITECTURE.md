# Architecture

## Verified stack (checked against npm registry and bundled docs, 2026-10-15)

| Concern | Choice | Version | Note |
| --- | --- | --- | --- |
| Framework | Next.js App Router, Turbopack | 16.4.1 | `cacheComponents` + `partialPrefetching` on (framework default for new apps) |
| UI runtime | React | 19.3.1 | |
| Language | TypeScript, `strict` | 6.0.3 | TS 7.0 exists and `next build` supports it, but `typescript-eslint` (via `eslint-config-next`) requires `<6.1`. Upgrade when it does. |
| i18n | next-intl | 4.14.9 | Locale from `next/root-params` (the old `setRequestLocale` is deprecated) |
| Content | `@next/mdx` + `@mdx-js/loader` | 16.4.1 / 3.1.1 | Plugins referenced by name — Turbopack requires serializable options |
| Highlighting | Shiki via `@shikijs/rehype` | 4.5.0 | Build-time, dual light/dark theme via CSS variables, zero client JS |
| Styling | Tailwind CSS + typography | 4.x / 0.5.20 | Design tokens in `globals.css`, `dark` class variant |
| Theme | next-themes | 0.4.6 | |
| Animation | Motion (`motion/react`) | 14.2.0 | Visualizer transitions; disabled under reduced motion |
| Type puzzles | TypeScript compiler API in a Server Action | 6.0.3 | Replaces a Sandpack playground: real `tsc` diagnostics, no heavy client bundle |
| Tests | Vitest + `scripts/smoke.mjs` | 5.0.4 | Unit tests per generator; e2e smoke over HTTP (Playwright not added — would need browser downloads) |

## Folder structure

```
src/
├── app/
│   ├── [locale]/                     # root layout lives here → `next/root-params` exposes `locale`
│   │   ├── layout.tsx                # <html lang>, providers, header/footer, static params per locale
│   │   ├── page.tsx                  # home
│   │   ├── not-found.tsx             # localized 404
│   │   ├── review/ resources/ glossary/  # review list, resource library, glossary index
│   │   └── learn/
│   │       ├── layout.tsx            # sidebar + content grid
│   │       ├── page.tsx              # all sections
│   │       └── [section]/
│   │           ├── page.tsx          # lessons in a section
│   │           └── [lesson]/page.tsx # renders the MDX lesson
│   ├── actions/typecheck.ts          # Server Action: type-checks puzzle answers
│   ├── global-not-found.tsx          # 404 for URLs outside any locale
│   └── globals.css                   # tokens, dark mode, Shiki themes
├── components/
│   ├── layout/                       # header, sidebar, locale switcher, theme
│   ├── mdx/                          # components usable in every lesson (Term, Callout, …)
│   ├── progress/                     # LessonProgress, DoneMark, SectionProgress, ReviewList
│   └── visualizer/                   # Visualizer player, primitives/, viz/<Name>Viz.tsx
├── content/
│   ├── registry.ts                   # course map: sections → lessons (titles, status)
│   ├── glossary.ts                   # term → localized hover definition
│   ├── puzzles.ts                    # TypeScript type puzzles
│   ├── resources.ts                  # typed access to resources.json
│   ├── load-lesson.ts                # dynamic MDX import
│   └── lessons/<section>/<lesson>/{en,uz}.mdx
├── visualizer/                       # framework-agnostic engine (no React)
│   ├── core/                         # Step<S> model, recorder, input parsing, graph/tree layout
│   └── algorithms/<name>.ts          # pure step generators (+ linear/nonlinear/runtime tests)
├── lib/progress.ts                   # localStorage progress + spaced repetition (useSyncExternalStore)
├── i18n/                             # routing, request config, typed navigation helpers
├── messages/{en,uz}.json             # UI strings (identical keys; typed via global.d.ts)
├── proxy.ts                          # locale negotiation + redirects (Next 16 "proxy", ex-middleware)
└── mdx-components.tsx                # global MDX component map
resources.json                        # verified links with `lastVerified`
scripts/                              # check-content, verify-resources, smoke
```

## Key decisions

1. **Static by default.** Every locale/section/lesson combination is enumerated through `generateStaticParams`; the build prerenders all of them. With Cache Components `dynamicParams = false` is not available, so unknown slugs are rejected at runtime with `notFound()`. Because that happens in streamed content, the response is the 404 UI with `noindex` but HTTP 200 — expected Next.js streaming behavior.
2. **Content ≠ code.** A lesson is two MDX files plus one entry in `registry.ts`. The registry holds only what navigation needs so the sidebar never loads MDX.
3. **Terms are never translated.** UI strings live in `messages/*.json`; glossary terms keep their English name in both locales and only the definition is localized. Uzbek uses the Latin modifier letter `ʻ` (U+02BB) for oʻ/gʻ.
4. **Visualizer engine.** Algorithms are pure functions returning `Step<S>[]` (`state`, highlighted `line`, `{en, uz}` explanation). The player is a reducer over an index into that array (play/pause/step/scrub/speed), so stepping back is free and every animation is unit-testable against the plain algorithm. Primitives (`ArrayView`, `PointerView`, `StackView`, `QueueView`, `TreeView`, `GraphView`, `GridView`, `HeapView`, `CallStackView`, `TimelineView`) render a state; under `prefers-reduced-motion` they switch to instant transitions and the per-step text remains the primary channel.
5. **Progressive enhancement.** Navigation, tooltips (CSS hover/focus) and the mobile menu (`<details>`) work without client JS; only the theme toggle, locale switcher, active-link highlighting, search, progress, quizzes and visualizers are client components. Visualizers are client components imported from MDX, so their code ships only with the lessons that use them.
6. **Event-loop simulator is a model.** It interprets a small JS subset (sync code, `setTimeout`, promises, `queueMicrotask`, `process.nextTick`, `setImmediate`) to show queue order; it is not a real engine and documents its assumptions in the lesson (e.g. timers vs `setImmediate` order outside I/O callbacks is not deterministic in Node).

7. **Responsive / mobile.** Checked with a headless-Chrome audit of every page at 320, 375, 768, 1024 and 1280 px (no page-level horizontal scroll, tap targets ≥ 40 px for primary controls). Phones get a hamburger menu (`MobileMenu`, a `<details>` that also works without JS and closes on navigation), a self-closing lessons menu, edge-to-edge code blocks, tables with a sticky first column, and diagrams that scroll sideways and also list their connections as text. Below `xl` the visualizer stacks as stage → explanation + controls → code, so the controls sit right under the animation. Glossary tooltips become a bottom card on phones; on wider screens `TermPositioner` keeps them inside the viewport.

8. **Instant navigation.** `params` is URL data, so section and lesson pages read it inside `<Suspense>` with a skeleton fallback; the static App Shell (skeleton) is ready before any click. Links upgrade to a full per-link prefetch on hover/touch/focus (`IntentLink`), and prev/next links prefetch eagerly; since every lesson is prerendered, those prefetches are served from static output. All MDX components, visualizers included, are passed from the page (`<Content components={mdxComponents} />`) so client components stay statically reachable from the page module, which Next's instant validation requires; each visualizer still ships as its own lazy chunk (`viz/lazy.tsx`).

9. **Design system & SEO.** OKLCH colour tokens (light: warm paper, dark: deep slate; text ≈13:1, no pure black/white), Poppins + JetBrains Mono (code ligatures disabled so `>=` stays two characters). Lesson body keeps a 44rem reading measure while visualizers (`data-wide`) use the full column; on xl+ the visualizer shows animation and the whole program side by side with no inner scrollbar. SEO: per-page canonical + hreflang (`x-default` = uz) via `pageMetadata`, `sitemap.ts`, `robots.ts`, `manifest.ts`, JSON-LD (WebSite/Organization on home, LearningResource + BreadcrumbList on lessons) and generated Open Graph images per locale and per lesson. Image routes read translations from the JSON files directly because next-intl's request config uses `next/root-params`, which Route Handlers don't support yet.

## Stages

1. ✅ Skeleton: Next.js, i18n (uz/en), MDX pipeline, layout, navigation, dark mode.
2. ✅ Visualizer engine: step model, controls (play/pause/step/speed/scrub/reset), input validation, primitives, unit tests.
3. ✅ MVP content: Event Loop, Sliding Window, Binary Search, Graph BFS/DFS, React Reconciliation, Node Streams & Backpressure.
4. ✅ Quality pass: depth, untranslated terms, Uzbek orthography, verified facts against bundled Next docs.
5. ✅ All sections (76 lessons, incl. JS toolkit, async patterns, modern JS/TS/React/Node), quizzes, progress tracking, review list, `Cmd+K` search, glossary page.
6. ✅ Resources page from `resources.json` (verified links only), content/resource/smoke scripts.
7. ✅ Handbook: principles, architecture (16), git (16), frontend tools (51 in 12 categories); grouped navigation.

10. **Handbook libraries.** Principles, architecture and git share one model (`content/library.ts`: categories → entries, a messages namespace each) and one set of components (`components/library/*`: sidebar, category view, entry page, category grid). Each library has its own thin route files (`/principles/[category]/[principle]`, `/architecture/[category]/[topic]`, `/git/[category]/[topic]`) and its own lazily loaded scene set, so a git page doesn't download architecture scenes. Tools are data-driven (`content/tools/registry.ts`) with one MDX page per category. The header groups all four under a `<details>`-based "Handbook" menu that works without JS; MDX links starting with `/` go through the locale-aware `Link`.

## Known caveats

- TypeScript 6.0.3 instead of 7 (see table).
- Unknown slugs render the 404 UI with `noindex` but HTTP 200 (streaming + Cache Components).
- No Uzbek-language resources are listed: none were verified to the same standard. MIT Press (CLRS) and LeetCode pages are excluded because they block automated verification (403).
