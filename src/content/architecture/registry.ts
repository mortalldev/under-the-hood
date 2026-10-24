import { row, type Library, type LibraryCategory, type LibraryEntry } from "../library";

/**
 * Map of the architecture library: three scales (frontend app, one
 * application, many services) → architecture styles. The body of each topic
 * is `architecture/<slug>/{en,uz}.mdx`, its animation a scene in
 * `visualizer/architecture/scenes.ts`. Style names are never translated.
 */
export const categorySlugs = ["frontend", "application", "distributed"] as const;
export type CategorySlug = (typeof categorySlugs)[number];

export const categories: LibraryCategory<CategorySlug>[] = [
  {
    slug: "frontend",
    title: { en: "Frontend architecture", uz: "Frontend arxitekturasi" },
    summary: {
      en: "How to organise a large frontend codebase and the teams working on it: folder rules, component systems, monorepos and how the UI talks to backends.",
      uz: "Katta frontend kod bazasini va unda ishlaydigan jamoalarni qanday tashkil qilish: papka qoidalari, komponent tizimlari, monorepo va UI backend bilan qanday gaplashadi.",
    },
    hue: "violet",
  },
  {
    slug: "application",
    title: { en: "Application architecture", uz: "Ilova arxitekturasi" },
    summary: {
      en: "Inside one deployable app: where business rules live, which way dependencies point, and how to keep a growing codebase in modules.",
      uz: "Bitta deploy qilinadigan ilova ichida: biznes qoidalar qayerda yashaydi, bogʻliqliklar qaysi tomonga qaraydi va oʻsib borayotgan kodni modullarda qanday saqlash kerak.",
    },
    hue: "teal",
  },
  {
    slug: "distributed",
    title: { en: "Distributed systems", uz: "Taqsimlangan tizimlar" },
    summary: {
      en: "Many services, one product: splitting by service, talking through events, separating reads from writes and keeping data consistent without one big transaction.",
      uz: "Koʻp service, bitta mahsulot: service'larga boʻlish, event'lar orqali gaplashish, oʻqish va yozishni ajratish hamda bitta katta transaction'siz ma'lumotni izchil saqlash.",
    },
    hue: "orange",
  },
];

const p = row<CategorySlug>;

export const topics: LibraryEntry<CategorySlug>[] = [
  // Frontend
  p("frontend", "feature-sliced-design", "FSD", "Feature-Sliced Design", undefined, "Layers, slices and segments: a folder standard where imports only point down.", "Layer, slice va segment'lar: import faqat pastga qaraydigan papka standarti.", ["atomic-design", "monorepo", "clean-architecture"]),
  p("frontend", "atomic-design", "ATOM", "Atomic Design", undefined, "Build UIs from atoms up to pages, the model behind most design systems.", "UI'ni atom'dan sahifagacha quring: koʻp design system'lar ortidagi model.", ["feature-sliced-design", "micro-frontends", "mvc-mvvm"]),
  p("frontend", "micro-frontends", "MFE", "Micro-frontends", undefined, "Split one web app between teams that build and deploy independently.", "Bitta veb-ilovani mustaqil quradigan va deploy qiladigan jamoalar orasida boʻling.", ["microservices", "monorepo", "bff"]),
  p("frontend", "monorepo", "MONO", "Monorepo", undefined, "Many packages, one repository, one dependency graph and a shared build cache.", "Koʻp package, bitta repository, bitta dependency graph va umumiy build cache.", ["micro-frontends", "feature-sliced-design", "modular-monolith"]),
  p("frontend", "bff", "BFF", "Backend for Frontend", undefined, "A thin server per client that shapes data exactly for that UI.", "Har bir client uchun ma'lumotni aynan shu UI'ga moslab beradigan yupqa server.", ["microservices", "micro-frontends", "hexagonal"]),

  // Application
  p("application", "layered", "N-TIER", "Layered architecture", "n-tier", "Presentation, business and data layers, each calling only the one below.", "Presentation, business va data layer'lari, har biri faqat pastdagisini chaqiradi.", ["clean-architecture", "hexagonal", "mvc-mvvm"]),
  p("application", "mvc-mvvm", "MVC", "MVC, MVVM and Flux", undefined, "Separate what the user sees from the state behind it, and pick which way data flows.", "Foydalanuvchi koʻradigan narsani orqasidagi state'dan ajrating va ma'lumot qaysi tomonga oqishini tanlang.", ["layered", "atomic-design", "cqrs"]),
  p("application", "hexagonal", "HEX", "Hexagonal architecture", "Ports and Adapters", "The core defines ports; databases, HTTP and queues are adapters plugged in from outside.", "Yadro port'larni belgilaydi; database, HTTP va queue tashqaridan ulanadigan adapter'lar.", ["clean-architecture", "layered", "domain-driven-design"]),
  p("application", "clean-architecture", "CLEAN", "Clean Architecture", undefined, "Concentric circles where source-code dependencies point only inward.", "Source code bogʻliqliklari faqat ichkariga qaraydigan konsentrik doiralar.", ["hexagonal", "layered", "feature-sliced-design"]),
  p("application", "modular-monolith", "MODMON", "Modular monolith", undefined, "One deployable, many modules with enforced boundaries — the usual step before microservices.", "Bitta deploy, chegaralari majburiy boʻlgan koʻp modul: odatda microservices'dan oldingi qadam.", ["microservices", "domain-driven-design", "monorepo"]),
  p("application", "domain-driven-design", "DDD", "Domain-Driven Design", undefined, "Model the software on the business language and split it into bounded contexts.", "Dasturni biznes tili asosida modellashtiring va bounded context'larga boʻling.", ["modular-monolith", "microservices", "hexagonal"]),

  // Distributed
  p("distributed", "microservices", "μSVC", "Microservices", undefined, "Small services owned by small teams, each with its own data, deployed on its own.", "Kichik jamoalarga tegishli kichik service'lar: har birining oʻz ma'lumoti bor va alohida deploy qilinadi.", ["modular-monolith", "event-driven", "saga"]),
  p("distributed", "event-driven", "EDA", "Event-driven architecture", undefined, "Services publish facts that happened; others subscribe without the publisher knowing them.", "Service'lar sodir boʻlgan faktlarni e'lon qiladi; boshqalar publisher bilmagan holda ularga obuna boʻladi.", ["event-sourcing", "saga", "cqrs"]),
  p("distributed", "cqrs", "CQRS", "CQRS", "Command Query Responsibility Segregation", "One model for writes, another shaped for reads.", "Yozish uchun bitta model, oʻqish uchun moslangan boshqa model.", ["event-sourcing", "event-driven", "mvc-mvvm"]),
  p("distributed", "event-sourcing", "ES", "Event Sourcing", undefined, "Store every change as an event; current state is a fold over the log.", "Har bir oʻzgarishni event sifatida saqlang; joriy holat log ustidan fold.", ["cqrs", "event-driven", "saga"]),
  p("distributed", "saga", "SAGA", "Saga pattern", undefined, "A chain of local transactions with compensating steps instead of one distributed transaction.", "Bitta taqsimlangan transaction oʻrniga kompensatsiya qadamlari bor lokal transaction'lar zanjiri.", ["event-driven", "microservices", "event-sourcing"]),
];

export const architectureLib: Library<CategorySlug> = { id: "architecture", base: "/architecture", categories, entries: topics };
