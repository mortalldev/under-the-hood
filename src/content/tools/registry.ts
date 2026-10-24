import type { Localized } from "@/visualizer/core/types";
import type { Hue } from "../library";

/**
 * The frontend toolchain: categories → tools. Each tool links to its own
 * official documentation (checked on TOOLS_CHECKED); each category also has
 * an MDX page `tools/<category>/{en,uz}.mdx` with examples and a comparison.
 * Tool names are never translated.
 */
export const TOOLS_CHECKED = "2026-10-24";

export const toolCategorySlugs = [
  "validation",
  "ui",
  "styling",
  "server-state",
  "client-state",
  "forms",
  "frameworks",
  "quality",
  "testing",
  "monorepo",
  "animation",
  "performance",
] as const;
export type ToolCategorySlug = (typeof toolCategorySlugs)[number];

export interface ToolCategory {
  slug: ToolCategorySlug;
  title: Localized;
  summary: Localized;
  hue: Hue;
  /** Slug of the tool to start with when there is no reason to pick another. */
  pick: string;
}

export interface Tool {
  slug: string;
  category: ToolCategorySlug;
  name: string;
  /** Official documentation. */
  docs: string;
  /** npm package(s) to install, when it is a package. */
  install?: string;
  by?: string;
  what: Localized;
  use: Localized;
  avoid: Localized;
}

const L = (en: string, uz: string): Localized => ({ en, uz });

export const toolCategories: ToolCategory[] = [
  {
    slug: "validation",
    title: L("Validation & schemas", "Validatsiya va schema'lar"),
    summary: L(
      "Check data at runtime where TypeScript can't see it — forms, API responses, env vars — and get the static type from the same schema.",
      "TypeScript koʻrmaydigan joyda — form, API javobi, env oʻzgaruvchilar — ma'lumotni runtime'da tekshiring va statik type'ni oʻsha schema'dan oling.",
    ),
    hue: "indigo",
    pick: "zod",
  },
  {
    slug: "ui",
    title: L("UI components", "UI komponentlar"),
    summary: L(
      "Accessible building blocks — dialogs, menus, comboboxes, tables — so you don't hand-roll focus traps and ARIA.",
      "Accessible qurilish bloklari — dialog, menu, combobox, jadval — focus trap va ARIA'ni qoʻlda yozmaslik uchun.",
    ),
    hue: "violet",
    pick: "shadcn-ui",
  },
  {
    slug: "styling",
    title: L("Styling", "Styling"),
    summary: L(
      "How CSS gets written, scoped and shipped: utility classes, scoped modules, compile-time CSS-in-JS and variant helpers.",
      "CSS qanday yoziladi, cheklanadi va yetkaziladi: utility class'lar, scoped module'lar, compile-time CSS-in-JS va variant helper'lar.",
    ),
    hue: "sky",
    pick: "tailwind",
  },
  {
    slug: "server-state",
    title: L("Server state & data fetching", "Server state va data fetching"),
    summary: L(
      "Data that lives on the server and is only cached in the browser: fetching, caching, deduping, revalidating and mutating it.",
      "Serverda yashab, brauzerda faqat cache qilinadigan ma'lumot: uni olish, cache qilish, takrorlarni birlashtirish, yangilash va oʻzgartirish.",
    ),
    hue: "teal",
    pick: "tanstack-query",
  },
  {
    slug: "client-state",
    title: L("Client state", "Client state"),
    summary: L(
      "State that exists only in the browser — UI toggles, wizards, selections, URL filters — and the libraries that share it without prop drilling.",
      "Faqat brauzerda mavjud state — UI toggle, wizard, tanlovlar, URL filter'lar — va uni prop drilling'siz boʻlishadigan kutubxonalar.",
    ),
    hue: "emerald",
    pick: "zustand",
  },
  {
    slug: "forms",
    title: L("Forms", "Form'lar"),
    summary: L(
      "Inputs, validation, errors and submission without re-rendering the whole page on every keystroke.",
      "Har bir tugma bosilganda butun sahifani qayta render qilmasdan input, validatsiya, xato va yuborish.",
    ),
    hue: "amber",
    pick: "react-hook-form",
  },
  {
    slug: "frameworks",
    title: L("Frameworks & routing", "Framework va routing"),
    summary: L(
      "The thing that owns routing, rendering (SSR, SSG, RSC) and data loading. Pick this first; most other choices follow from it.",
      "Routing, rendering (SSR, SSG, RSC) va data yuklashga egalik qiladigan narsa. Buni birinchi tanlang; boshqa tanlovlarning koʻpi undan kelib chiqadi.",
    ),
    hue: "indigo",
    pick: "nextjs",
  },
  {
    slug: "quality",
    title: L("Types, lint & format", "Type, lint va format"),
    summary: L(
      "The checks that run on every save and every PR: the type checker, a linter for bugs, a formatter so nobody argues about commas, and dead-code detection.",
      "Har bir saqlash va har bir PR'da ishlaydigan tekshiruvlar: type checker, bug'lar uchun linter, vergul haqida bahs boʻlmasligi uchun formatter va ishlatilmagan kodni topish.",
    ),
    hue: "rose",
    pick: "typescript",
  },
  {
    slug: "testing",
    title: L("Testing", "Testing"),
    summary: L(
      "Unit, component, end-to-end and visual tests, plus network mocking — the testing pyramid with today's tools.",
      "Unit, component, end-to-end va vizual testlar hamda network mocking: bugungi tool'lar bilan testing piramidasi.",
    ),
    hue: "emerald",
    pick: "vitest",
  },
  {
    slug: "monorepo",
    title: L("Package managers & monorepos", "Package manager va monorepo"),
    summary: L(
      "Installing dependencies, linking local packages, running tasks in dependency order and caching their results.",
      "Dependency oʻrnatish, lokal package'larni bogʻlash, task'larni dependency tartibida ishga tushirish va natijalarini cache qilish.",
    ),
    hue: "orange",
    pick: "pnpm",
  },
  {
    slug: "animation",
    title: L("Animation", "Animatsiya"),
    summary: L(
      "From CSS transitions to layout animations and scroll timelines — and the platform API that animates whole page changes.",
      "CSS transition'lardan layout animatsiya va scroll timeline'largacha — hamda butun sahifa oʻzgarishini animatsiya qiladigan platforma API'si.",
    ),
    hue: "violet",
    pick: "motion",
  },
  {
    slug: "performance",
    title: L("Performance & monitoring", "Performance va monitoring"),
    summary: L(
      "Measure what real users feel (Core Web Vitals), profile renders, and catch production errors before users report them.",
      "Real foydalanuvchilar sezadigan narsani oʻlchang (Core Web Vitals), render'larni profile qiling va production xatolarini foydalanuvchi aytmasidan oldin ushlang.",
    ),
    hue: "sky",
    pick: "web-vitals",
  },
];

const t = (
  category: ToolCategorySlug,
  slug: string,
  name: string,
  docs: string,
  install: string | undefined,
  by: string | undefined,
  what: Localized,
  use: Localized,
  avoid: Localized,
): Tool => ({ category, slug, name, docs, install, by, what, use, avoid });

export const tools: Tool[] = [
  // Validation
  t("validation", "zod", "Zod", "https://zod.dev/", "zod", undefined,
    L("TypeScript-first schema library: declare a schema once, validate at runtime, infer the type with z.infer.", "TypeScript-first schema kutubxonasi: schema'ni bir marta yozing, runtime'da tekshiring, type'ni z.infer bilan oling."),
    L("Default choice for forms, API responses, env variables and Server Action input. The ecosystem (React Hook Form, tRPC, many AI SDKs) supports it first.", "Form, API javobi, env oʻzgaruvchilar va Server Action input'i uchun standart tanlov. Ekotizim (React Hook Form, tRPC, koʻp AI SDK'lar) uni birinchi qoʻllaydi."),
    L("Bundle size is critical on a tiny client widget — look at Valibot.", "Kichik client widget'da bundle hajmi juda muhim boʻlsa — Valibot'ga qarang.")),
  t("validation", "valibot", "Valibot", "https://valibot.dev/", "valibot", undefined,
    L("Schema library built from small functions you compose with pipe(), so unused validators are tree-shaken away.", "pipe() bilan birlashtiriladigan kichik funksiyalardan qurilgan schema kutubxonasi: ishlatilmagan validator'lar tree-shaking bilan tushib qoladi."),
    L("Client bundles where every kilobyte counts: widgets, edge functions, embedded forms.", "Har bir kilobayt muhim boʻlgan client bundle'lar: widget, edge function, joylashtiriladigan form'lar."),
    L("The team already knows Zod and size is not a measured problem.", "Jamoa Zod'ni allaqachon biladi va hajm oʻlchangan muammo emas.")),
  t("validation", "arktype", "ArkType", "https://arktype.io/", "arktype", undefined,
    L("Schemas written as TypeScript-like strings (\"string.email\"), compiled into fast validators.", "TypeScript'ga oʻxshash satrlar (\"string.email\") bilan yoziladigan, tez validator'larga kompilyatsiya qilinadigan schema'lar."),
    L("Hot paths that validate a lot of data and teams that like type syntax over method chains.", "Koʻp ma'lumot tekshiriladigan qaynoq yoʻllar va method zanjiri oʻrniga type sintaksisini yoqtiradigan jamoalar."),
    L("You need the widest library support today — Zod still has more integrations.", "Bugun eng keng kutubxona qoʻllovi kerak boʻlsa — Zod'da integratsiyalar hali koʻproq.")),
  t("validation", "standard-schema", "Standard Schema", "https://standardschema.dev/", "@standard-schema/spec", undefined,
    L("A tiny shared interface implemented by Zod, Valibot, ArkType and others, so libraries can accept any of them.", "Zod, Valibot, ArkType va boshqalar amalga oshiradigan kichik umumiy interface: kutubxonalar ularning istalganini qabul qila oladi."),
    L("You write a library (form, router, RPC) that should accept the user's validator of choice.", "Foydalanuvchi tanlagan validator'ni qabul qilishi kerak boʻlgan kutubxona (form, router, RPC) yozyapsiz."),
    L("You are building an app — just use your validator directly.", "Ilova quryapsiz — validator'ingizni toʻgʻridan-toʻgʻri ishlating.")),

  // UI components
  t("ui", "shadcn-ui", "shadcn/ui", "https://ui.shadcn.com/docs", "npx shadcn@latest init", undefined,
    L("Not a dependency: a CLI that copies accessible, Tailwind-styled component source into your repo, built on Base UI (the default for new projects since July 2026) or Radix primitives.", "Dependency emas: accessible, Tailwind bilan bezalgan komponent kodini repo'ngizga koʻchiradigan CLI, Base UI (2026-yil iyulidan yangi loyihalar uchun standart) yoki Radix primitive'lari ustida qurilgan."),
    L("You want a good-looking starting point you fully own and can edit — dashboards, SaaS apps, internal tools.", "Toʻliq egalik qiladigan va tahrirlay oladigan chiroyli boshlangʻich nuqta kerak — dashboard, SaaS ilova, ichki tool'lar."),
    L("You need a versioned package that many apps upgrade together — copied code doesn't update itself.", "Koʻp ilova birga yangilaydigan versiyali package kerak — koʻchirilgan kod oʻzi yangilanmaydi.")),
  t("ui", "radix", "Radix Primitives", "https://www.radix-ui.com/primitives/docs/overview/introduction", "radix-ui", "WorkOS",
    L("Unstyled, accessible primitives (Dialog, Popover, DropdownMenu…) that handle focus, keyboard and ARIA; you bring the styles.", "Stilsiz, accessible primitive'lar (Dialog, Popover, DropdownMenu…): focus, klaviatura va ARIA'ni boshqaradi; stilni siz berasiz."),
    L("Building your own design system on solid behaviour. shadcn/ui can generate on top of it, and older shadcn/ui projects use it.", "Ishonchli xatti-harakat ustida oʻz design system'ingizni quryapsiz. shadcn/ui uning ustida ham generatsiya qila oladi, eski shadcn/ui loyihalari shuni ishlatadi."),
    L("You want finished visuals out of the box.", "Tayyor koʻrinish darhol kerak.")),
  t("ui", "base-ui", "Base UI", "https://base-ui.com/", "@base-ui/react", undefined,
    L("Unstyled accessible components from people behind Radix, Floating UI and Material UI; an alternative primitive layer.", "Radix, Floating UI va Material UI ortidagi odamlarning stilsiz accessible komponentlari: muqobil primitive qatlam."),
    L("Starting a new design system and you want an actively developed primitive set; new shadcn/ui projects use it by default.", "Yangi design system boshlayapsiz va faol rivojlanayotgan primitive toʻplam kerak; yangi shadcn/ui loyihalari standart holatda shuni ishlatadi."),
    L("Your app already works on Radix — migrating primitives rarely pays off on its own.", "Ilovangiz Radix'da ishlab turibdi — primitive'larni koʻchirish oʻz-oʻzidan kamdan-kam oʻzini oqlaydi.")),
  t("ui", "react-aria", "React Aria", "https://react-aria.adobe.com/", "react-aria-components", "Adobe",
    L("Adobe's hooks and components with the most thorough accessibility and internationalisation behaviour available, including date pickers.", "Adobe'ning hook va komponentlari: mavjud eng puxta accessibility va i18n xatti-harakati, date picker'lar bilan birga."),
    L("Accessibility is a hard requirement (gov, enterprise) or you need complex widgets: date/time pickers, tables, drag-and-drop.", "Accessibility qat'iy talab (davlat, korporativ) yoki murakkab widget'lar kerak: sana/vaqt picker, jadval, drag-and-drop."),
    L("A simple marketing site — the API is more verbose than Radix.", "Oddiy marketing sayt — API Radix'dan uzunroq.")),
  t("ui", "tanstack-table", "TanStack Table", "https://tanstack.com/table/latest", "@tanstack/react-table", "TanStack",
    L("Headless table logic: sorting, filtering, grouping, pagination and column state; you render the markup.", "Headless jadval mantigʻi: saralash, filter, guruhlash, pagination va ustun state'i; markup'ni siz render qilasiz."),
    L("Data grids in admin panels and dashboards. Pair with TanStack Virtual for 10k+ rows.", "Admin panel va dashboard'lardagi data grid'lar. 10k+ qator uchun TanStack Virtual bilan birga."),
    L("A static table of 20 rows — a plain <table> is enough.", "20 qatorli statik jadval — oddiy <table> yetarli.")),

  // Styling
  t("styling", "tailwind", "Tailwind CSS", "https://tailwindcss.com/docs", "tailwindcss @tailwindcss/vite", "Tailwind Labs",
    L("Utility classes compiled to a small CSS file; v4 is configured in CSS with @theme instead of a JS config.", "Kichik CSS faylga kompilyatsiya qilinadigan utility class'lar; v4 JS config oʻrniga CSS ichida @theme bilan sozlanadi."),
    L("Most new React projects: styles live next to markup, no naming, no dead CSS. This site uses it.", "Koʻp yangi React loyihalar: stil markup yonida, nom oʻylash yoʻq, oʻlik CSS yoʻq. Bu sayt ham shuni ishlatadi."),
    L("The team writes a lot of hand-tuned CSS or the markup is owned by a CMS you can't add classes to.", "Jamoa koʻp qoʻlda sozlangan CSS yozadi yoki markup class qoʻsha olmaydigan CMS'ga tegishli.")),
  t("styling", "css-modules", "CSS Modules", "https://github.com/css-modules/css-modules", undefined, undefined,
    L("Plain .module.css files whose class names are scoped per component at build time. Built into Next.js and Vite.", "Class nomlari build vaqtida har bir komponentga cheklanadigan oddiy .module.css fayllar. Next.js va Vite'ga oʻrnatilgan."),
    L("You want real CSS (complex selectors, animations) without global leaks and with zero runtime.", "Global toʻqnashuvsiz va runtime'siz haqiqiy CSS (murakkab selector, animatsiya) kerak."),
    L("You need a design-token system shared across many components — utilities or StyleX scale better.", "Koʻp komponentlar boʻylab umumiy design-token tizimi kerak — utility yoki StyleX yaxshiroq kengayadi.")),
  t("styling", "stylex", "StyleX", "https://stylexjs.com/", "@stylexjs/stylex", "Meta",
    L("Meta's CSS-in-JS that compiles to atomic CSS at build time; built for and used across Meta's web apps.", "Build vaqtida atomic CSS'ga kompilyatsiya qilinadigan Meta'ning CSS-in-JS'i; Meta'ning veb-ilovalari uchun yaratilgan va ularda ishlatiladi."),
    L("Large apps with many teams that need type-safe, conflict-free styles and predictable specificity.", "Type-safe, toʻqnashuvsiz stil va oldindan aytiladigan specificity kerak boʻlgan koʻp jamoali katta ilovalar."),
    L("Small projects — the build setup is heavier than Tailwind's.", "Kichik loyihalar — build sozlamasi Tailwind'nikidan ogʻirroq.")),
  t("styling", "cva", "cva + tailwind-merge", "https://cva.style/", "class-variance-authority tailwind-merge clsx", undefined,
    L("cva maps variant props (size, intent) to class lists; tailwind-merge resolves conflicting utilities (px-2 vs px-4).", "cva variant prop'larni (size, intent) class roʻyxatlariga moslaydi; tailwind-merge toʻqnashgan utility'larni hal qiladi (px-2 va px-4)."),
    L("Building Button, Badge, Input with variants in a Tailwind design system — shadcn/ui's cn() helper is exactly clsx + tailwind-merge.", "Tailwind design system'ida variantli Button, Badge, Input quryapsiz — shadcn/ui'ning cn() helper'i aynan clsx + tailwind-merge."),
    L("A component has one look — a plain class string is clearer.", "Komponentning bitta koʻrinishi bor — oddiy class satri aniqroq.")),

  // Server state
  t("server-state", "tanstack-query", "TanStack Query", "https://tanstack.com/query/latest", "@tanstack/react-query", "TanStack",
    L("Async state manager: caches server data by query key, dedupes requests, refetches stale data, handles mutations and optimistic updates.", "Async state menejeri: server ma'lumotini query key boʻyicha cache qiladi, takroriy so'rovlarni birlashtiradi, eskirgan ma'lumotni qayta oladi, mutation va optimistic update'larni boshqaradi."),
    L("Client components that read and write REST or GraphQL data: dashboards, infinite lists, anything with loading/error/retry states.", "REST yoki GraphQL ma'lumotini oʻqib-yozadigan client komponentlar: dashboard, cheksiz roʻyxat, loading/error/retry holati bor har qanday narsa."),
    L("Data is fetched in Server Components and never changes on the client — the framework's cache already does the job.", "Ma'lumot Server Component'larda olinadi va client'da oʻzgarmaydi — framework cache'i bu ishni allaqachon qiladi.")),
  t("server-state", "swr", "SWR", "https://swr.vercel.app/", "swr", "Vercel",
    L("A smaller hook library built around stale-while-revalidate: show cached data, refetch in the background.", "Stale-while-revalidate atrofida qurilgan kichikroq hook kutubxonasi: cache'dagi ma'lumotni koʻrsating, fonda qayta oling."),
    L("Mostly reads, few mutations, and you want the smallest API.", "Asosan oʻqish, kam mutation va eng kichik API kerak."),
    L("Heavy mutation flows, optimistic updates and devtools matter — TanStack Query covers more.", "Ogʻir mutation oqimlari, optimistic update va devtools muhim — TanStack Query koʻproq qamraydi.")),
  t("server-state", "trpc", "tRPC", "https://trpc.io/docs", "@trpc/server @trpc/client", undefined,
    L("End-to-end typed API: call server procedures from the client with types inferred from the server code, no codegen.", "Uchdan-uchgacha typed API: server procedure'larini client'dan chaqiring, type'lar server kodidan olinadi, codegen yoʻq."),
    L("A TypeScript monorepo where the same team owns frontend and backend.", "Frontend va backend bitta jamoaga tegishli boʻlgan TypeScript monorepo."),
    L("Public APIs or non-TypeScript clients (mobile, partners) — use REST/OpenAPI or GraphQL.", "Ochiq API yoki TypeScript boʻlmagan client'lar (mobil, hamkorlar) — REST/OpenAPI yoki GraphQL ishlating.")),
  t("server-state", "relay", "Relay", "https://relay.dev/", "react-relay", "Meta",
    L("Meta's GraphQL client: each component declares the data it needs as a fragment, and the compiler builds one query per screen.", "Meta'ning GraphQL client'i: har bir komponent kerakli ma'lumotini fragment sifatida e'lon qiladi, compiler esa har ekran uchun bitta query quradi."),
    L("Large GraphQL apps where many teams own parts of one screen — the model behind facebook.com.", "Bitta ekranning qismlari koʻp jamoalarga tegishli boʻlgan katta GraphQL ilovalar — facebook.com ortidagi model."),
    L("No GraphQL server, or a small app — the compiler and conventions are a real investment.", "GraphQL server yoʻq yoki ilova kichik — compiler va qoidalar jiddiy sarmoya.")),

  // Client state
  t("client-state", "zustand", "Zustand", "https://zustand.docs.pmnd.rs/", "zustand", "Poimandres",
    L("A tiny store created with create(); components subscribe to the slice they select, so only they re-render.", "create() bilan yaratiladigan kichik store; komponentlar oʻzi tanlagan qismga obuna boʻladi, shuning uchun faqat ular qayta render boʻladi."),
    L("Shared UI state across distant components: cart, editor state, player controls.", "Uzoq komponentlar orasidagi umumiy UI state: savat, editor holati, player boshqaruvi."),
    L("The state is really server data (use TanStack Query) or belongs in the URL (use nuqs).", "State aslida server ma'lumoti (TanStack Query ishlating) yoki URL'ga tegishli (nuqs ishlating).")),
  t("client-state", "jotai", "Jotai", "https://jotai.org/", "jotai", "Poimandres",
    L("Atomic state: many small atoms, derived atoms computed from them, components subscribe per atom.", "Atomic state: koʻp kichik atom, ulardan hisoblanadigan derived atom'lar, komponentlar har bir atom'ga obuna boʻladi."),
    L("Lots of independent, interdependent pieces of state — editors, canvases, spreadsheets.", "Koʻp mustaqil va oʻzaro bogʻliq state boʻlaklari — editor, canvas, spreadsheet."),
    L("One simple global store is enough.", "Bitta oddiy global store yetarli.")),
  t("client-state", "redux-toolkit", "Redux Toolkit", "https://redux.js.org/toolkit/", "@reduxjs/toolkit react-redux", "Redux team",
    L("The official, modern way to write Redux: slices, Immer-powered reducers, RTK Query for data, excellent devtools and time travel.", "Redux yozishning rasmiy zamonaviy usuli: slice'lar, Immer asosidagi reducer'lar, ma'lumot uchun RTK Query, zoʻr devtools va time travel."),
    L("Large teams that want strict, traceable state changes, or an existing Redux codebase.", "Qat'iy va kuzatiladigan state oʻzgarishlarini xohlaydigan katta jamoalar yoki mavjud Redux kod bazasi."),
    L("A new small app — Zustand gives the same store model with far less ceremony.", "Yangi kichik ilova — Zustand xuddi shu store modelini ancha kam rasmiyatchilik bilan beradi.")),
  t("client-state", "xstate", "XState", "https://stately.ai/docs/xstate", "xstate @xstate/react", "Stately",
    L("State machines and statecharts: explicit states and transitions, so impossible states can't happen.", "State machine va statechart'lar: aniq holatlar va oʻtishlar, shuning uchun imkonsiz holatlar yuz bermaydi."),
    L("Flows with many states and rules: checkout, onboarding wizards, media players, WebRTC calls.", "Koʻp holat va qoidali oqimlar: checkout, onboarding wizard, media player, WebRTC qoʻngʻiroqlar."),
    L("A boolean toggle — useState is fine.", "Bitta boolean toggle — useState yetarli.")),
  t("client-state", "nuqs", "nuqs", "https://nuqs.dev/", "nuqs", undefined,
    L("useState that lives in the URL query string, typed and parsed, with adapters for Next.js, React Router and others.", "URL query satrida yashaydigan useState: typed va parse qilingan, Next.js, React Router va boshqalar uchun adapter'lar bilan."),
    L("Filters, tabs, search, pagination — anything users should be able to share, bookmark or go back to.", "Filter, tab, qidiruv, pagination — foydalanuvchi ulasha, bookmark qila yoki orqaga qayta olishi kerak boʻlgan har narsa."),
    L("Secret or large state — the URL is visible and has length limits.", "Maxfiy yoki katta state — URL koʻrinib turadi va uzunligi cheklangan.")),

  // Forms
  t("forms", "react-hook-form", "React Hook Form", "https://react-hook-form.com/", "react-hook-form @hookform/resolvers", undefined,
    L("Forms built on uncontrolled inputs and refs, so typing doesn't re-render the form; validates with Zod via a resolver.", "Uncontrolled input va ref'larga qurilgan form'lar: yozish form'ni qayta render qilmaydi; resolver orqali Zod bilan tekshiradi."),
    L("Client-side forms with many fields, dynamic field arrays and instant validation.", "Koʻp maydonli, dinamik field array'li va darhol validatsiyali client-side form'lar."),
    L("A two-field form posted to a Server Action — React 19's useActionState is enough.", "Server Action'ga yuboriladigan ikki maydonli form — React 19'ning useActionState'i yetarli.")),
  t("forms", "tanstack-form", "TanStack Form", "https://tanstack.com/form/latest", "@tanstack/react-form", "TanStack",
    L("Headless, fully type-safe form state with field-level subscriptions and Standard Schema validators.", "Field darajasidagi obunalar va Standard Schema validator'lari bilan headless, toʻliq type-safe form state."),
    L("You want the strictest types for deeply nested forms, or the same form logic across React, Vue, Solid.", "Chuqur ichma-ich form'lar uchun eng qat'iy type'lar kerak yoki bir xil form mantigʻi React, Vue, Solid'da kerak."),
    L("The team already ships React Hook Form successfully.", "Jamoa React Hook Form bilan allaqachon muvaffaqiyatli ishlayapti.")),
  t("forms", "use-action-state", "useActionState", "https://react.dev/reference/react/useActionState", undefined, "React (Meta)",
    L("React 19 hook that runs a form action, tracks its pending state and returns its result; works before JS loads with Server Actions.", "Form action'ni ishga tushiradigan, pending holatini kuzatadigan va natijasini qaytaradigan React 19 hook'i; Server Action bilan JS yuklanishidan oldin ham ishlaydi."),
    L("Simple forms in Next.js or React Router that post to the server: login, newsletter, settings.", "Next.js yoki React Router'da serverga yuboriladigan oddiy form'lar: login, newsletter, sozlamalar."),
    L("Rich client-side validation on every keystroke — add React Hook Form.", "Har bir tugmada boy client-side validatsiya — React Hook Form qoʻshing.")),

  // Frameworks
  t("frameworks", "nextjs", "Next.js", "https://nextjs.org/docs", "npx create-next-app@latest", "Vercel",
    L("Full-stack React framework: App Router, React Server Components, Server Actions, streaming, caching and many render modes.", "Full-stack React framework: App Router, React Server Components, Server Actions, streaming, caching va koʻp render rejimlari."),
    L("Content and product sites that need SEO and fast first load, plus an API layer in the same project. This site is built with it.", "SEO va tez birinchi yuklanish kerak boʻlgan kontent va mahsulot saytlari, hamda shu loyihaning ichida API qatlami. Bu sayt shu bilan qurilgan."),
    L("A fully client-side app behind a login (no SEO) — Vite + a router is simpler to host.", "Login ortidagi toʻliq client-side ilova (SEO yoʻq) — Vite + router'ni host qilish soddaroq.")),
  t("frameworks", "react-router", "React Router", "https://reactrouter.com/", "npx create-react-router@latest", undefined,
    L("The most used React router; in framework mode (the successor of Remix) it adds loaders, actions and SSR.", "Eng koʻp ishlatiladigan React router; framework rejimida (Remix'ning davomchisi) loader, action va SSR qoʻshadi."),
    L("You want web-standard loaders/actions and freedom to deploy anywhere, or you are upgrading an existing React Router app.", "Veb-standart loader/action va istalgan joyga deploy erkinligi kerak yoki mavjud React Router ilovani yangilayapsiz."),
    L("You rely on React Server Components features first — Next.js has the most mature support.", "Birinchi navbatda React Server Components imkoniyatlariga tayanasiz — eng yetuk qoʻllov Next.js'da.")),
  t("frameworks", "tanstack-start", "TanStack Start", "https://tanstack.com/start/latest", undefined, "TanStack",
    L("Full-stack framework on TanStack Router: fully type-safe routes, search params and server functions, built on Vite.", "TanStack Router ustidagi full-stack framework: toʻliq type-safe route, search param va server function'lar, Vite asosida."),
    L("Type safety across routes and URL state matters most, and the team is comfortable with a younger framework.", "Route va URL state boʻylab type safety eng muhim va jamoa yoshroq framework bilan ishlashga tayyor."),
    L("You need the largest hiring pool and ecosystem — Next.js is still the default.", "Eng katta mutaxassislar bozori va ekotizim kerak — standart hali ham Next.js.")),
  t("frameworks", "astro", "Astro", "https://docs.astro.build/", "npm create astro@latest", undefined,
    L("Content-first framework: pages ship zero JS by default and interactive \"islands\" hydrate only where needed, with React or other UI libraries.", "Kontent-first framework: sahifalar standart holatda JS'siz yuboriladi, interaktiv \"orol\"lar faqat kerakli joyda hydrate boʻladi, React yoki boshqa UI kutubxonalar bilan."),
    L("Docs, blogs, marketing and landing pages where most of the page is static.", "Sahifaning koʻp qismi statik boʻlgan docs, blog, marketing va landing sahifalar."),
    L("App-like products with lots of shared client state.", "Koʻp umumiy client state'li ilovasimon mahsulotlar.")),

  // Quality
  t("quality", "typescript", "TypeScript", "https://www.typescriptlang.org/docs/", "typescript", "Microsoft",
    L("Static types for JavaScript; with strict mode it catches null errors, typos and broken contracts before runtime.", "JavaScript uchun statik type'lar; strict rejimda null xatolari, xato yozilgan nomlar va buzilgan kontraktlarni runtime'dan oldin ushlaydi."),
    L("Every project that will live longer than a weekend. Turn on \"strict\" from day one.", "Bir hafta oxiridan uzoq yashaydigan har bir loyiha. \"strict\"ni birinchi kundan yoqing."),
    L("Never skip it in a team codebase; use JSDoc types only where a build step is impossible.", "Jamoa kod bazasida hech qachon tashlab ketmang; JSDoc type'larni faqat build qadami imkonsiz joyda ishlating.")),
  t("quality", "eslint", "ESLint", "https://eslint.org/docs/latest/", "npm init @eslint/config@latest", "OpenJS Foundation",
    L("The pluggable JavaScript linter, configured with a flat eslint.config.js; plugins like react-hooks and typescript-eslint catch real bugs.", "Plugin qoʻshiladigan JavaScript linter, flat eslint.config.js bilan sozlanadi; react-hooks va typescript-eslint kabi plugin'lar real bug'larni ushlaydi."),
    L("You need framework rules (eslint-config-next, react-hooks) or type-aware lint rules.", "Framework qoidalari (eslint-config-next, react-hooks) yoki type'ni biladigan lint qoidalari kerak."),
    L("Lint time is a bottleneck on a huge repo — add Oxlint in front for the fast rules.", "Ulkan repo'da lint vaqti tor joy — tez qoidalar uchun oldiga Oxlint qoʻshing.")),
  t("quality", "prettier", "Prettier", "https://prettier.io/docs/", "prettier", undefined,
    L("Opinionated formatter: rewrites code into one consistent style so reviews never discuss formatting.", "Qat'iy fikrli formatter: kodni bitta izchil uslubga qayta yozadi, shunda review'larda formatlash muhokama qilinmaydi."),
    L("Any team codebase, run on save and in CI (prettier --check).", "Har qanday jamoa kod bazasi, saqlashda va CI'da (prettier --check) ishga tushiring."),
    L("You already use Biome, which formats too.", "Formatlashni ham qiladigan Biome'ni allaqachon ishlatyapsiz.")),
  t("quality", "biome", "Biome", "https://biomejs.dev/", "@biomejs/biome", undefined,
    L("One fast Rust binary that formats and lints JS, TS, JSON and CSS, largely Prettier-compatible.", "JS, TS, JSON va CSS'ni formatlaydigan va lint qiladigan bitta tez Rust binary, asosan Prettier bilan mos."),
    L("New projects that want one tool and one config instead of ESLint + Prettier.", "ESLint + Prettier oʻrniga bitta tool va bitta config xohlaydigan yangi loyihalar."),
    L("You depend on ESLint plugins with no Biome equivalent.", "Biome'da muqobili yoʻq ESLint plugin'lariga bogʻliqsiz.")),
  t("quality", "oxlint", "Oxlint", "https://oxc.rs/docs/guide/usage/linter.html", "oxlint", "VoidZero",
    L("A Rust linter from the Oxc project that runs ESLint-style rules many times faster.", "Oxc loyihasidan Rust linter: ESLint uslubidagi qoidalarni bir necha barobar tezroq ishlatadi."),
    L("Large repos: run it first in CI and pre-commit, keep ESLint only for rules Oxlint lacks.", "Katta repo'lar: CI va pre-commit'da birinchi uni ishga tushiring, ESLint'ni faqat Oxlint'da yoʻq qoidalar uchun qoldiring."),
    L("A small project where ESLint already runs in seconds.", "ESLint soniyalarda ishlaydigan kichik loyiha.")),
  t("quality", "knip", "Knip", "https://knip.dev/", "knip", undefined,
    L("Finds unused files, exports and dependencies across a project or monorepo.", "Loyiha yoki monorepo boʻylab ishlatilmagan fayl, export va dependency'larni topadi."),
    L("Cleaning up an old codebase or keeping a monorepo lean in CI.", "Eski kod bazasini tozalash yoki CI'da monorepo'ni ixcham saqlash."),
    L("Framework conventions it doesn't know produce false positives — configure entry points first.", "U bilmaydigan framework qoidalari notoʻgʻri natija beradi — avval entry point'larni sozlang.")),

  // Testing
  t("testing", "vitest", "Vitest", "https://vitest.dev/", "vitest", "VoidZero",
    L("Fast test runner powered by Vite with a Jest-compatible API, native ESM and TypeScript, and a browser mode.", "Vite asosidagi tez test runner: Jest bilan mos API, native ESM va TypeScript hamda browser rejimi."),
    L("Unit and component tests in any Vite or modern TS project. This site's tests run on it.", "Har qanday Vite yoki zamonaviy TS loyihada unit va component testlar. Bu saytning testlari ham shunda ishlaydi."),
    L("A large existing Jest suite that works — migrate only when speed or ESM pain justifies it.", "Ishlab turgan katta Jest test toʻplami — faqat tezlik yoki ESM muammosi oqlasa koʻchiring.")),
  t("testing", "testing-library", "Testing Library", "https://testing-library.com/docs/react-testing-library/intro/", "@testing-library/react @testing-library/user-event", undefined,
    L("Render components and query them the way users do — by role, label and text — instead of implementation details.", "Komponentlarni render qiling va ularni foydalanuvchi kabi — role, label va matn boʻyicha — so'rang, ichki tafsilotlar boʻyicha emas."),
    L("Component tests that survive refactors: \"click the Save button, expect the toast\".", "Refactor'dan keyin ham ishlaydigan component testlar: \"Save tugmasini bosing, toast'ni kuting\"."),
    L("Testing pure functions — call them directly.", "Pure function'larni test qilish — ularni toʻgʻridan-toʻgʻri chaqiring.")),
  t("testing", "playwright", "Playwright", "https://playwright.dev/", "npm init playwright@latest", "Microsoft",
    L("End-to-end tests in real Chromium, Firefox and WebKit, with auto-waiting, tracing, parallel runs and codegen.", "Real Chromium, Firefox va WebKit'da end-to-end testlar: avtomatik kutish, tracing, parallel ishga tushirish va codegen bilan."),
    L("Critical user journeys (sign-up, checkout) run on every PR, and visual regression screenshots.", "Har bir PR'da ishlaydigan muhim foydalanuvchi yoʻllari (roʻyxatdan oʻtish, checkout) va vizual regression screenshot'lar."),
    L("Covering every edge case end-to-end — keep E2E few and push details down to unit tests.", "Har bir edge case'ni end-to-end qamrash — E2E'ni kam saqlang, tafsilotlarni unit testlarga tushiring.")),
  t("testing", "msw", "Mock Service Worker", "https://mswjs.io/", "msw", undefined,
    L("Intercepts real network requests (a Service Worker in the browser, a request interceptor in Node) and answers with your handlers.", "Real network so'rovlarini ushlab oladi (brauzerda Service Worker, Node'da request interceptor) va sizning handler'laringiz bilan javob beradi."),
    L("One set of API mocks shared by tests, Storybook and local development before the backend is ready.", "Testlar, Storybook va backend tayyor boʻlgunicha lokal development uchun umumiy bitta API mock toʻplami."),
    L("Contract correctness matters — also run a few tests against the real API.", "Kontrakt toʻgʻriligi muhim — real API'ga qarshi ham bir nechta test ishga tushiring.")),
  t("testing", "storybook", "Storybook", "https://storybook.js.org/docs", "npm create storybook@latest", "Chromatic",
    L("A workshop to build and document components in isolation, with interaction, accessibility and visual tests.", "Komponentlarni alohida qurish va hujjatlash uchun ustaxona: interaction, accessibility va vizual testlar bilan."),
    L("A shared design system or component library used by several teams.", "Bir nechta jamoa ishlatadigan umumiy design system yoki komponent kutubxonasi."),
    L("A single small app with few reusable components.", "Qayta ishlatiladigan komponentlari kam boʻlgan bitta kichik ilova.")),

  // Monorepo
  t("monorepo", "pnpm", "pnpm", "https://pnpm.io/workspaces", "npm install -g pnpm", undefined,
    L("Package manager with a content-addressable store and strict node_modules, plus first-class workspaces for monorepos.", "Content-addressable store va qat'iy node_modules'li package manager, monorepo uchun birinchi darajali workspace'lar bilan."),
    L("Monorepos and CI where install speed, disk use and catching undeclared (phantom) dependencies matter.", "Oʻrnatish tezligi, disk hajmi va e'lon qilinmagan (phantom) dependency'larni ushlash muhim boʻlgan monorepo va CI."),
    L("A tool in your chain only works with npm's flat layout (rare today).", "Zanjiringizdagi biror tool faqat npm'ning tekis tuzilmasi bilan ishlaydi (bugun kam uchraydi).")),
  t("monorepo", "turborepo", "Turborepo", "https://turborepo.dev/docs", "npx create-turbo@latest", "Vercel",
    L("Task runner for JS monorepos: runs build/test/lint in dependency order, in parallel, and caches outputs locally and remotely.", "JS monorepo uchun task runner: build/test/lint'ni dependency tartibida, parallel ishga tushiradi va natijalarni lokal va remote cache qiladi."),
    L("A pnpm/npm workspace with several apps and packages where CI time keeps growing.", "CI vaqti oʻsib borayotgan, bir nechta ilova va package'li pnpm/npm workspace."),
    L("You need code generators, module-boundary rules and non-JS projects — Nx covers more.", "Code generator, module-boundary qoidalari va JS boʻlmagan loyihalar kerak — Nx koʻproq qamraydi.")),
  t("monorepo", "nx", "Nx", "https://nx.dev/", "npx create-nx-workspace@latest", "Nx",
    L("Monorepo platform: project graph, affected-only builds, caching, generators and enforced module boundaries.", "Monorepo platformasi: project graph, faqat ta'sirlangan qismni build qilish, caching, generator'lar va majburiy module chegaralari."),
    L("Large enterprise monorepos with many teams and mixed stacks (Angular, React, Node, Java).", "Koʻp jamoali va aralash stack'li (Angular, React, Node, Java) katta korporativ monorepo'lar."),
    L("Two packages and one app — Turborepo or plain workspaces are lighter.", "Ikki package va bitta ilova — Turborepo yoki oddiy workspace yengilroq.")),
  t("monorepo", "changesets", "Changesets", "https://github.com/changesets/changesets", "@changesets/cli", undefined,
    L("Each PR adds a small markdown file describing the change; the tool bumps versions and writes changelogs for published packages.", "Har bir PR oʻzgarishni tasvirlaydigan kichik markdown fayl qoʻshadi; tool versiyalarni oshiradi va nashr qilinadigan package'lar uchun changelog yozadi."),
    L("A monorepo that publishes packages to npm.", "npm'ga package nashr qiladigan monorepo."),
    L("Only private apps that are deployed, never published.", "Faqat deploy qilinadigan, hech qachon nashr qilinmaydigan private ilovalar.")),

  // Animation
  t("animation", "motion", "Motion", "https://motion.dev/docs", "motion", undefined,
    L("Animation library (formerly Framer Motion): declarative animate props, exit animations, layout animations and gestures, GPU-accelerated where possible.", "Animatsiya kutubxonasi (avvalgi Framer Motion): deklarativ animate prop'lar, exit animatsiya, layout animatsiya va gesture'lar, iloji boricha GPU tezlashtirishi bilan."),
    L("UI motion in React: enter/exit, shared layout transitions, drag. Every visualizer on this site animates with it.", "React'da UI harakati: enter/exit, umumiy layout transition, drag. Bu saytdagi har bir visualizer shu bilan animatsiya qilinadi."),
    L("A hover fade — a CSS transition costs no JavaScript.", "Hover'dagi fade — CSS transition hech qanday JavaScript talab qilmaydi.")),
  t("animation", "view-transitions", "View Transition API", "https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API", undefined, "Web platform",
    L("Browser API that snapshots the old and new UI and animates between them, for in-page updates and page navigations.", "Eski va yangi UI'ning suratini olib, ular orasida animatsiya qiladigan brauzer API'si: sahifa ichidagi yangilanish va sahifa navigatsiyasi uchun."),
    L("Page-to-page transitions and list reordering with almost no JS; degrade gracefully where unsupported.", "Deyarli JS'siz sahifadan-sahifaga oʻtish va roʻyxat tartibini oʻzgartirish; qoʻllanmaydigan joyda muloyim ishlamay qoladi."),
    L("Complex choreographed or physics-based motion.", "Murakkab xoreografiyali yoki fizikaga asoslangan harakat.")),
  t("animation", "gsap", "GSAP", "https://gsap.com/docs/v3/", "gsap", "Webflow",
    L("Timeline-based animation engine, framework-agnostic, with ScrollTrigger for scroll-driven storytelling; free to use including plugins.", "Timeline asosidagi, framework'ga bogʻliq boʻlmagan animatsiya dvigateli, scroll'ga bogʻliq hikoya uchun ScrollTrigger bilan; plugin'lari bilan birga bepul."),
    L("Marketing sites and complex sequenced or scroll-driven animations.", "Marketing saytlar va murakkab ketma-ket yoki scroll'ga bogʻliq animatsiyalar."),
    L("App UI state transitions in React — Motion fits React's model better.", "React'dagi ilova UI state oʻtishlari — Motion React modeliga yaxshiroq mos keladi.")),

  // Performance
  t("performance", "web-vitals", "web-vitals", "https://github.com/GoogleChrome/web-vitals", "web-vitals", "Google Chrome",
    L("Tiny library that measures Core Web Vitals (LCP, INP, CLS) the way Chrome does, in real users' browsers.", "Core Web Vitals'ni (LCP, INP, CLS) Chrome qanday oʻlchasa shunday, real foydalanuvchilar brauzerida oʻlchaydigan kichik kutubxona."),
    L("Send field data to your analytics to see what real users experience — lab scores alone can mislead.", "Real foydalanuvchilar nimani boshdan kechirishini koʻrish uchun field ma'lumotni analytics'ga yuboring — faqat lab natijalari aldashi mumkin."),
    L("Your host or framework already reports Web Vitals to a dashboard you use.", "Host'ingiz yoki framework'ingiz Web Vitals'ni siz ishlatadigan dashboard'ga allaqachon yuboradi.")),
  t("performance", "lighthouse", "Lighthouse", "https://developer.chrome.com/docs/lighthouse", undefined, "Google",
    L("Lab audit for performance, accessibility, SEO and best practices, built into Chrome DevTools and runnable in CI.", "Performance, accessibility, SEO va best practice uchun lab audit: Chrome DevTools'ga oʻrnatilgan, CI'da ham ishga tushiriladi."),
    L("Catch regressions before release and find concrete fixes (render-blocking resources, image sizes).", "Release'dan oldin regression'larni ushlash va aniq tuzatishlarni topish (render'ni bloklaydigan resurslar, rasm oʻlchamlari)."),
    L("Treating the score as the goal — optimise the field metrics users feel.", "Ballni maqsad deb bilish — foydalanuvchi sezadigan field metrikalarni optimallashtiring.")),
  t("performance", "react-devtools", "React DevTools Profiler", "https://react.dev/learn/react-developer-tools", undefined, "React (Meta)",
    L("Browser extension to inspect the component tree, props and hooks, and record which components rendered, why, and for how long.", "Komponent daraxti, prop va hook'larni koʻrish hamda qaysi komponent nima uchun va qancha vaqt render boʻlganini yozib olish uchun brauzer kengaytmasi."),
    L("Before adding memo or useMemo: find the component that actually re-renders too often.", "memo yoki useMemo qoʻshishdan oldin: haqiqatan ham juda koʻp qayta render boʻladigan komponentni toping."),
    L("Network or bundle problems — use the Network panel and a bundle analyzer.", "Network yoki bundle muammolari — Network paneli va bundle analyzer'dan foydalaning.")),
  t("performance", "sentry", "Sentry", "https://docs.sentry.io/platforms/javascript/guides/nextjs/", "@sentry/nextjs", "Sentry",
    L("Error and performance monitoring: stack traces with source maps, release tracking, traces across frontend and backend, session replay.", "Xato va performance monitoring: source map'li stack trace, release kuzatuvi, frontend va backend boʻylab trace'lar, session replay."),
    L("Any production app: know about crashes from alerts, not from users.", "Har qanday production ilova: crash'lar haqida foydalanuvchidan emas, alert'dan biling."),
    L("Data can't leave your infrastructure — self-host it or use OpenTelemetry with your own backend.", "Ma'lumot infratuzilmangizdan chiqa olmaydi — self-host qiling yoki oʻz backend'ingiz bilan OpenTelemetry ishlating.")),
];

export const isToolCategory = (s: string): s is ToolCategorySlug => (toolCategorySlugs as readonly string[]).includes(s);

export const getToolCategory = (slug: ToolCategorySlug) => toolCategories.find((c) => c.slug === slug)!;

export const toolsIn = (category: ToolCategorySlug) => tools.filter((x) => x.category === category);

export const toolBySlug = (slug: string) => tools.find((x) => x.slug === slug);

/** The overview's "default stack": one pick per category, in display order. */
export const defaultStack = toolCategories.map((c) => ({ category: c, tool: toolBySlug(c.pick)! }));
