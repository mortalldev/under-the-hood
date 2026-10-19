import type { Localized } from "@/visualizer/core/types";

/**
 * Map of the principles library: categories → principles. Like the course
 * registry it holds only what navigation needs; the body of each principle is
 * `principles/<slug>/{en,uz}.mdx` and its animation is a scene in
 * `visualizer/principles/scenes.ts`. Principle names are never translated.
 */
export const categorySlugs = ["solid", "simplicity", "design", "reliability", "clean-code"] as const;
export type CategorySlug = (typeof categorySlugs)[number];

export interface PrincipleCategory {
  slug: CategorySlug;
  title: Localized;
  summary: Localized;
  /** Tailwind colour family used for the category's accents. */
  hue: "indigo" | "emerald" | "sky" | "amber" | "rose";
}

export interface PrincipleMeta {
  slug: string;
  category: CategorySlug;
  /** Badge text: the letter or acronym (S, DRY, SoC…). */
  short: string;
  name: string;
  /** What the acronym stands for, when the name is one. */
  expansion?: string;
  tagline: Localized;
  related: string[];
}

export const categories: PrincipleCategory[] = [
  {
    slug: "solid",
    title: { en: "SOLID", uz: "SOLID" },
    summary: {
      en: "Five object-oriented design principles by Robert C. Martin that keep classes small, replaceable and easy to extend.",
      uz: "Robert C. Martin'ning class'larni kichik, almashtiriladigan va kengaytirish oson qilib saqlaydigan beshta OOP dizayn tamoyili.",
    },
    hue: "indigo",
  },
  {
    slug: "simplicity",
    title: { en: "Simplicity", uz: "Soddalik" },
    summary: {
      en: "Write less, repeat less, guess less: DRY, KISS, YAGNI and the trap of optimizing too early.",
      uz: "Kamroq yozing, kamroq takrorlang, kamroq taxmin qiling: DRY, KISS, YAGNI va erta optimallashtirish tuzogʻi.",
    },
    hue: "emerald",
  },
  {
    slug: "design",
    title: { en: "Module design", uz: "Modul dizayni" },
    summary: {
      en: "How to draw boundaries between parts of a program so a change stays in one place.",
      uz: "Oʻzgarish bitta joyda qolishi uchun dastur qismlari orasidagi chegaralarni qanday chizish kerak.",
    },
    hue: "sky",
  },
  {
    slug: "reliability",
    title: { en: "Reliable code", uz: "Ishonchli kod" },
    summary: {
      en: "Principles that make code predictable: fail early, surprise no one, separate reads from writes, limit what can change.",
      uz: "Kodni oldindan aytib boʻladigan qiladigan tamoyillar: erta xato bering, hech kimni hayratlantirmang, oʻqish va yozishni ajrating, oʻzgaradigan narsani cheklang.",
    },
    hue: "amber",
  },
  {
    slug: "clean-code",
    title: { en: "Clean code practice", uz: "Clean code amaliyoti" },
    summary: {
      en: "The everyday vocabulary of keeping a codebase healthy: smells, refactoring, technical debt and the Boy Scout Rule.",
      uz: "Kod bazasini sogʻlom saqlashning kundalik lugʻati: code smell, refactoring, technical debt va Boy Scout Rule.",
    },
    hue: "rose",
  },
];

const p = (
  category: CategorySlug,
  slug: string,
  short: string,
  name: string,
  expansion: string | undefined,
  en: string,
  uz: string,
  related: string[],
): PrincipleMeta => ({ category, slug, short, name, expansion, tagline: { en, uz }, related });

export const principles: PrincipleMeta[] = [
  // SOLID
  p("solid", "single-responsibility", "S", "Single Responsibility", "Single Responsibility Principle", "A module should have one reason to change.", "Modulning oʻzgarishi uchun bitta sabab boʻlishi kerak.", ["separation-of-concerns", "coupling-cohesion", "interface-segregation"]),
  p("solid", "open-closed", "O", "Open/Closed", "Open/Closed Principle", "Extend behaviour by adding code, not by editing working code.", "Xatti-harakatni ishlayotgan kodni tahrirlab emas, yangi kod qoʻshib kengaytiring.", ["dependency-inversion", "composition-over-inheritance", "liskov-substitution"]),
  p("solid", "liskov-substitution", "L", "Liskov Substitution", "Liskov Substitution Principle", "A subtype must be usable anywhere its parent is expected.", "Subtype parent kutilgan har qanday joyda ishlata olinishi kerak.", ["composition-over-inheritance", "open-closed", "least-astonishment"]),
  p("solid", "interface-segregation", "I", "Interface Segregation", "Interface Segregation Principle", "Many small interfaces beat one fat one.", "Bitta katta interface'dan koʻplab kichik interface'lar yaxshiroq.", ["single-responsibility", "least-privilege", "coupling-cohesion"]),
  p("solid", "dependency-inversion", "D", "Dependency Inversion", "Dependency Inversion Principle", "Depend on abstractions, not on concrete details.", "Aniq tafsilotlarga emas, abstraksiyalarga bogʻlaning.", ["open-closed", "coupling-cohesion", "separation-of-concerns"]),

  // Simplicity
  p("simplicity", "dry", "DRY", "DRY", "Don't Repeat Yourself", "Every piece of knowledge lives in exactly one place.", "Har bir bilim faqat bitta joyda yashaydi.", ["kiss", "code-smells", "refactoring"]),
  p("simplicity", "kiss", "KISS", "KISS", "Keep It Simple, Stupid", "Prefer the simplest solution that works.", "Ishlaydigan eng oddiy yechimni tanlang.", ["yagni", "dry", "least-astonishment"]),
  p("simplicity", "yagni", "YAGNI", "YAGNI", "You Aren't Gonna Need It", "Build what is needed now, not what might be needed later.", "Keyin kerak boʻlishi mumkin boʻlganini emas, hozir keraklisini quring.", ["kiss", "premature-optimization", "technical-debt"]),
  p("simplicity", "premature-optimization", "PO", "Premature Optimization", undefined, "Measure before you optimize; clarity first.", "Optimallashtirishdan oldin oʻlchang; avval aniqlik.", ["yagni", "kiss", "refactoring"]),

  // Module design
  p("design", "separation-of-concerns", "SoC", "Separation of Concerns", undefined, "Each part of the program handles one concern.", "Dasturning har bir qismi bitta masala bilan shugʻullanadi.", ["single-responsibility", "coupling-cohesion", "encapsulation"]),
  p("design", "coupling-cohesion", "C/C", "Coupling & Cohesion", undefined, "Low coupling between modules, high cohesion inside them.", "Modullar orasida past bogʻliqlik, ular ichida yuqori aloqadorlik.", ["separation-of-concerns", "dependency-inversion", "law-of-demeter"]),
  p("design", "encapsulation", "ENC", "Encapsulation", "Information hiding", "Hide the internals; expose a small, safe interface.", "Ichki tuzilmani yashiring; kichik va xavfsiz interface oching.", ["tell-dont-ask", "law-of-demeter", "immutability"]),
  p("design", "composition-over-inheritance", "CoI", "Composition over Inheritance", undefined, "Build behaviour by combining parts, not by deep class trees.", "Xatti-harakatni chuqur class daraxti bilan emas, qismlarni birlashtirib quring.", ["liskov-substitution", "open-closed", "coupling-cohesion"]),
  p("design", "law-of-demeter", "LoD", "Law of Demeter", "Principle of least knowledge", "Talk only to your immediate friends.", "Faqat yaqin doʻstlaringiz bilan gaplashing.", ["tell-dont-ask", "encapsulation", "coupling-cohesion"]),
  p("design", "tell-dont-ask", "TDA", "Tell, Don't Ask", undefined, "Tell objects what to do instead of pulling their data out.", "Obyektdan ma'lumotini soʻrab olish oʻrniga, unga nima qilishni ayting.", ["encapsulation", "law-of-demeter", "command-query-separation"]),

  // Reliable code
  p("reliability", "fail-fast", "FF", "Fail Fast", undefined, "Detect bad state early and loudly.", "Notoʻgʻri holatni erta va aniq aniqlang.", ["least-astonishment", "immutability", "code-smells"]),
  p("reliability", "least-astonishment", "POLA", "Least Astonishment", "Principle of Least Astonishment", "Code should behave the way readers expect.", "Kod oʻquvchi kutganidek ishlashi kerak.", ["command-query-separation", "kiss", "liskov-substitution"]),
  p("reliability", "command-query-separation", "CQS", "Command–Query Separation", undefined, "A function either changes state or returns data, not both.", "Funksiya yo holatni oʻzgartiradi, yo ma'lumot qaytaradi — ikkalasini emas.", ["least-astonishment", "immutability", "tell-dont-ask"]),
  p("reliability", "immutability", "IMM", "Immutability", undefined, "Create new values instead of changing old ones.", "Eski qiymatlarni oʻzgartirish oʻrniga yangisini yarating.", ["command-query-separation", "encapsulation", "fail-fast"]),
  p("reliability", "least-privilege", "PoLP", "Least Privilege", "Principle of Least Privilege", "Give each part only the access it needs.", "Har bir qismga faqat kerakli ruxsatni bering.", ["interface-segregation", "encapsulation", "fail-fast"]),

  // Clean code practice
  p("clean-code", "code-smells", "SMELL", "Code Smells", undefined, "Surface symptoms that point to deeper design problems.", "Chuqurroq dizayn muammosiga ishora qiluvchi tashqi belgilar.", ["refactoring", "technical-debt", "dry"]),
  p("clean-code", "refactoring", "REF", "Refactoring", undefined, "Improve structure without changing behaviour.", "Xatti-harakatni oʻzgartirmasdan tuzilmani yaxshilang.", ["code-smells", "boy-scout-rule", "technical-debt"]),
  p("clean-code", "technical-debt", "DEBT", "Technical Debt", undefined, "Shortcuts today are paid back with interest later.", "Bugungi qisqa yoʻllar ertaga foizi bilan qaytariladi.", ["refactoring", "boy-scout-rule", "yagni"]),
  p("clean-code", "boy-scout-rule", "BSR", "Boy Scout Rule", undefined, "Leave the code a little cleaner than you found it.", "Kodni topganingizdan sal tozaroq holda qoldiring.", ["refactoring", "technical-debt", "code-smells"]),
];

export const isCategorySlug = (s: string): s is CategorySlug => (categorySlugs as readonly string[]).includes(s);

export const getCategory = (slug: CategorySlug) => categories.find((c) => c.slug === slug)!;

export const principlesIn = (category: CategorySlug) => principles.filter((x) => x.category === category);

export const getPrinciple = (category: string, slug: string) =>
  principles.find((x) => x.category === category && x.slug === slug);

export const principleBySlug = (slug: string) => principles.find((x) => x.slug === slug);

export const principleParams = () => principles.map((x) => ({ category: x.category, principle: x.slug }));

/** Previous/next across the whole library, in registry order. */
export function principleNeighbours(slug: string) {
  const i = principles.findIndex((x) => x.slug === slug);
  return { prev: i > 0 ? principles[i - 1] : undefined, next: i < principles.length - 1 ? principles[i + 1] : undefined };
}

/** Class sets per category hue (kept literal so Tailwind sees them). */
export const hueClass: Record<PrincipleCategory["hue"], { badge: string; ring: string; soft: string; text: string }> = {
  indigo: { badge: "bg-indigo-500/12 text-indigo-700 dark:text-indigo-300", ring: "hover:border-indigo-500/50", soft: "from-indigo-500/12", text: "text-indigo-700 dark:text-indigo-300" },
  emerald: { badge: "bg-emerald-500/12 text-emerald-700 dark:text-emerald-300", ring: "hover:border-emerald-500/50", soft: "from-emerald-500/12", text: "text-emerald-700 dark:text-emerald-300" },
  sky: { badge: "bg-sky-500/12 text-sky-700 dark:text-sky-300", ring: "hover:border-sky-500/50", soft: "from-sky-500/12", text: "text-sky-700 dark:text-sky-300" },
  amber: { badge: "bg-amber-500/14 text-amber-800 dark:text-amber-300", ring: "hover:border-amber-500/50", soft: "from-amber-500/14", text: "text-amber-800 dark:text-amber-300" },
  rose: { badge: "bg-rose-500/12 text-rose-700 dark:text-rose-300", ring: "hover:border-rose-500/50", soft: "from-rose-500/12", text: "text-rose-700 dark:text-rose-300" },
};
