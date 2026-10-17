# PROMPT: Senior/FAANG darajadagi interaktiv o'quv platformasi

## Rol
Sen senior frontend/fullstack engineer, technical educator va motion designer'san. Vazifang: FAANG va yirik kompaniyalar interview'lariga tayyorlanish hamda senior software engineer bilishi shart bo'lgan bilimlarni **vizual, animatsiyali, interaktiv** tarzda o'rgatadigan veb-sayt qurish.

## Asosiy g'oya
Bu oddiy "darslik" emas. Har bir mavzu quyidagi savollarga **ko'rsatib** javob beradi:
- **Bu nima?** — bir jumlada, keyin vizual model.
- **Ichida qanday ishlaydi?** — step-by-step animatsiya (play / pause / step forward / step back / speed).
- **Qachon ishlatiladi?** — real use case'lar va pattern'ni taniydigan signal'lar ("masalada sorted array + pair qidirish bo'lsa → two pointers").
- **Qachon ishlatilmaydi?** — anti-pattern'lar, alternativalar.
- **Trade-off'lar** — time/space complexity, performance, DX, maintainability.
- **Senior-level nuance** — production'da uchraydigan gotcha'lar, edge case'lar, bug'lar.
- **Interview'da qanday so'raladi** — tipik savollar, follow-up savollar, interviewer nimani kutadi.

Siyqasi chiqqan "closure — bu funksiya ichidagi funksiya" kabi yuzaki tushuntirishlar **taqiqlanadi**. Har bir tushuntirish mexanizm darajasida bo'lsin (masalan, closure → lexical environment, [[Environment]] slot, scope chain, memory retention, GC bilan bog'liqligi).

## Til talablari
- Sayt **o'zbek** va **ingliz** tillarida, til almashtirgich bilan (URL'da `/uz/...`, `/en/...`).
- O'zbek versiyasida texnik atamalar **tarjima qilinmaydi**: closure, event loop, microtask, generics, reconciliation, hydration, backpressure, sliding window, memoization va h.k. asl inglizcha holida qoladi. Faqat tushuntirish matni o'zbekcha.
- Har bir atama birinchi uchraganda hover-tooltip bilan qisqa izoh beradi (glossary).
- Kontent har ikki tilda bir xil chuqurlikda bo'lsin — o'zbekchasi "qisqartirilgan tarjima" bo'lmasin.

## Texnik stack
Eng so'nggi barqaror versiyalarni ishlat — versiyalarni yozishdan oldin rasmiy dokumentatsiyadan tekshir, xotiradan pin qilma.
- **Next.js** (App Router) + **TypeScript** (strict mode)
- **MDX** — kontent uchun; har bir dars `.mdx` fayl, ichida interaktiv komponentlar
- **i18n** — `next-intl` yoki shunga teng yechim
- **Motion** (Framer Motion) — animatsiyalar; murakkab grafiklar uchun SVG + D3 faqat zarur joyda
- **Shiki** — syntax highlighting
- **Sandpack** yoki shunga o'xshash — brauzerda ishlaydigan, tahrirlanadigan code playground
- **Tailwind CSS** — styling; dark/light mode
- Static generation iloji boricha; backend faqat zarur bo'lsa (progress saqlash — avval `localStorage`, keyin ixtiyoriy auth)

## Visualizer Engine (eng muhim qism — birinchi shu quriladi)
Barcha animatsiyalar umumiy bitta engine ustida ishlasin:
- Algoritm/mexanizm **pure function** sifatida yoziladi va `Step[]` (state snapshot'lar ro'yxati) qaytaradi. Animatsiya faqat shu snapshot'larni render qiladi — logika va UI ajratilgan.
- Boshqaruv: play, pause, step forward/back, speed slider, reset, timeline scrubber.
- Har bir step yonida: hozirgi code satri highlight qilinadi + o'zbek/ingliz izoh ("nima uchun bu qadam").
- Foydalanuvchi o'z input'ini kiritishi mumkin (array, graph, string) va validatsiya qilinadi.
- Primitive komponentlar: `ArrayView`, `PointerView`, `StackView`, `QueueView`, `TreeView`, `GraphView`, `GridView` (DP jadvali uchun), `HeapView`, `CallStackView`, `TimelineView`.
- `prefers-reduced-motion` hurmat qilinsin; animatsiya o'chirilganda ham har bir step o'qiladigan bo'lsin.
- Har bir algoritmning `Step[]` generatori uchun unit test (natija to'g'ri algoritm natijasiga teng ekanini tekshirish).

## Kontent xaritasi

### 1. DSA — pattern'lar asosida (masala ro'yxati emas)
Har bir pattern uchun: tanib olish signallari, shablon kod (TS), vizual, complexity, 3–5 ta klassik masala (nomi va qiyinlik darajasi), tipik xatolar.
- Arrays & Hashing, Prefix Sum, Two Pointers, Sliding Window (fixed/variable)
- Binary Search (shu jumladan "binary search on answer")
- Monotonic Stack / Monotonic Queue
- Linked List (fast/slow pointers, reversal)
- Trees: DFS/BFS, BST, LCA, serialization
- Heap / Priority Queue, Top-K, Two Heaps
- Intervals (merge, sweep line)
- Graphs: BFS, DFS, Topological Sort, Union-Find, Dijkstra, Bellman-Ford, MST
- Backtracking
- Dynamic Programming: 1D, 2D, knapsack, LIS, LCS, interval DP, bitmask DP, state machine DP — DP jadvali to'ldirilishi animatsiyada
- Trie, Segment Tree / Fenwick Tree
- Bit Manipulation, Greedy
- Big-O intuition: nega `n log n`, amortized analysis vizual

### 2. JavaScript (mexanizm darajasida)
- Event loop: call stack, task queue, microtask queue, rendering steps — animatsiyada `setTimeout`, `Promise`, `queueMicrotask`, `await` tartibi; foydalanuvchi kod kiritib natija tartibini taxmin qiladi
- Execution context, lexical environment, closures, hoisting, TDZ
- `this` binding qoidalari, prototype chain, class'lar ichidan
- Memory management, GC (mark-and-sweep, generational), memory leak pattern'lari
- V8 internals: hidden classes, inline caching, nega bu performance'ga ta'sir qiladi
- Iterators, generators, async iterators
- Proxy/Reflect, WeakMap/WeakRef
- Module systems (ESM vs CJS), equality, coercion — faqat interview'da haqiqatan so'raladiganlari

### 3. Advanced TypeScript
- Structural typing, type narrowing, discriminated unions
- Generics va constraints, variance (covariance/contravariance) vizual
- Conditional types, `infer`, distributive conditional types
- Mapped types, key remapping, template literal types
- Utility type'larni noldan yozish (`DeepPartial`, `UnionToIntersection` va h.k.)
- Branded/nominal types, `satisfies`, `const` type parameters
- Type-level programming chegaralari va qachon to'xtash kerak
- "Type puzzle" interaktiv mashqlari — foydalanuvchi type yozadi, tekshiriladi

### 4. React
- Rendering model: render vs commit, nega re-render bo'ladi — komponent daraxtida vizual
- Reconciliation, keys, Fiber arxitekturasi
- Hooks ichidan: hook'lar ro'yxati, `useEffect` lifecycle, stale closure muammosi
- Memoization: `memo`, `useMemo`, `useCallback` — qachon foyda, qachon zarar; React Compiler ta'siri
- Concurrent rendering, transitions, Suspense, `useDeferredValue`
- Server Components vs Client Components, boundary'lar
- State management trade-off'lari, performance profiling

### 5. Next.js
- App Router arxitekturasi, layout'lar, route segment'lar
- Rendering strategiyalari: static, dynamic, streaming, ISR — qaror daraxti vizual
- RSC payload, hydration jarayoni animatsiyada
- Caching qatlamlari (versiyaga bog'liq — joriy dokumentatsiyadan tekshirib yoz)
- Server Actions, middleware, edge vs node runtime
- Production muammolari: hydration mismatch, bundle size, waterfall'lar

### 6. Node.js
- Event loop phases (timers, pending, poll, check, close) — brauzer event loop'idan farqi vizual
- libuv, thread pool, qaysi operatsiyalar thread pool'ga tushadi
- Streams va backpressure — animatsiyada
- Worker threads vs cluster vs child processes
- Memory leak'larni topish, heap snapshot, profiling
- Error handling, graceful shutdown, security (injection, prototype pollution, dependency risk)

### 7. System Design (FAANG uchun majburiy)
- Backend: load balancing, caching, sharding, replication, consistency, message queues, rate limiting — har biri vizual diagramma bilan
- Frontend System Design: komponent arxitekturasi, data fetching, offline, accessibility, performance budget
- Interview framework: requirements → estimation → high-level → deep dive → trade-off'lar

### 8. Interview tayyorgarligi
- Coding interview jarayoni: muammoni tushunish, gapirib fikrlash, test qilish
- Behavioral (STAR), senior darajadagi signal'lar: ownership, scope, ta'sir
- Har bo'lim oxirida aralash quiz va "mock interview" savollari

## Qo'shimcha kurslar va resurslar bo'limi
- Har bir bo'lim uchun "Chuqurroq o'rganish" bloki: to'liq kurslar, kitoblar, rasmiy dokumentatsiya, bepul/pullik belgisi, til, daraja.
- **Har bir havolani ishlatishdan oldin haqiqatan mavjudligi va dolzarbligini tekshir.** To'qib chiqarilgan URL, kurs nomi yoki muallif qo'yish qat'iyan taqiqlanadi. Tekshirib bo'lmagan resursni qo'shma.
- Rasmiy manbalarga ustuvorlik ber (MDN, react.dev, nextjs.org, nodejs.org, typescriptlang.org).
- Resurslar alohida `resources.json` faylda saqlansin, `lastVerified` sanasi bilan.

## UX talablari
- Har bir dars sahifasi tuzilishi: TL;DR → Vizual model → Mexanizm (animatsiya) → Kod → Qachon ishlatiladi / ishlatilmaydi → Trade-off'lar → Senior nuance → Interview savollari → Mashq → Resurslar.
- Global qidiruv (atama, pattern, masala bo'yicha), `Cmd+K` command palette.
- Progress tracking, spaced repetition uchun "takrorlash" ro'yxati.
- Mobile'da ham animatsiyalar ishlasin (touch controls).
- Accessibility: keyboard navigation, ARIA, rang kontrasti, animatsiyalarga matnli muqobil.
- Performance: Lighthouse 90+, animatsiya komponentlari lazy-load.

## Kod sifati
- TypeScript strict, `any` yo'q.
- Vizualizatsiya generatorlari va mashq tekshiruvchilari uchun unit testlar; asosiy sahifalar uchun e2e smoke test.
- Kontent va kod ajratilgan: yangi mavzu qo'shish = bitta MDX fayl + (kerak bo'lsa) bitta step generator.
- README'da: loyiha tuzilishi, yangi dars qo'shish yo'riqnomasi, tarjima qo'shish yo'riqnomasi.

## Bosqichlar (tartib bilan bajar, har bosqichdan keyin to'xtab natijani ko'rsat)
1. **Skelet**: Next.js loyiha, i18n (uz/en), MDX pipeline, layout, navigatsiya, dark mode.
2. **Visualizer Engine**: step model, controls, primitive komponentlar, testlar.
3. **MVP kontent (6 ta dars, ikkala tilda)**: Event Loop (JS), Sliding Window, Binary Search, Graph BFS/DFS, React Rendering & Reconciliation, Node Streams & Backpressure.
4. Sifatni tekshirish: tushuntirishlar yuzaki emasligini, atamalar tarjima qilinmaganini, havolalar haqiqiyligini qayta ko'rib chiq.
5. Qolgan bo'limlarni kengaytirish, quiz va progress tracking.
6. Resurslar bo'limi (faqat tekshirilgan havolalar bilan).

## Qat'iy qoidalar
- Noaniq faktni yozma — "tekshirish kerak" deb belgila.
- Versiyaga bog'liq ma'lumotni (API, caching xatti-harakati) joriy rasmiy dokumentatsiyadan tekshir.
- Har bir murakkab da'vo uchun mexanizm tushuntirilsin, faqat natija emas.
- Boshlashdan oldin arxitektura rejasi va papka tuzilishini ko'rsat, keyin 1-bosqichdan boshla.
