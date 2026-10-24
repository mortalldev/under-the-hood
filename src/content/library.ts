import type { Localized } from "@/visualizer/core/types";

/**
 * A "library" is a reference section with the shape category → entry, where
 * every entry is one MDX page with its own scene animation: principles,
 * architecture styles and git topics. Registries hold only what navigation
 * needs; the body of an entry is `<dir>/<slug>/{en,uz}.mdx`.
 */
export type LibraryId = "principles" | "architecture" | "git";

/** Messages namespace of each library (same keys in each). */
export const libraryNs = { principles: "Principles", architecture: "Architecture", git: "Git" } as const satisfies Record<LibraryId, string>;

export type Hue = "indigo" | "emerald" | "sky" | "amber" | "rose" | "violet" | "teal" | "orange";

export interface LibraryCategory<C extends string = string> {
  slug: C;
  title: Localized;
  summary: Localized;
  /** Tailwind colour family used for the category's accents. */
  hue: Hue;
}

export interface LibraryEntry<C extends string = string> {
  slug: string;
  category: C;
  /** Badge text: a letter, acronym or command (S, FSD, rebase…). */
  short: string;
  name: string;
  /** What the acronym stands for, when the name is one. */
  expansion?: string;
  tagline: Localized;
  related: string[];
}

export interface Library<C extends string = string> {
  id: LibraryId;
  /** URL prefix, e.g. "/principles". */
  base: `/${LibraryId}`;
  categories: LibraryCategory<C>[];
  entries: LibraryEntry<C>[];
}

/** Row helper shared by the registries (check-content parses `p("cat", "slug", …)`). */
export const row = <C extends string>(
  category: C,
  slug: string,
  short: string,
  name: string,
  expansion: string | undefined,
  en: string,
  uz: string,
  related: string[],
): LibraryEntry<C> => ({ category, slug, short, name, expansion, tagline: { en, uz }, related });

export const isCategory = <C extends string>(lib: Library<C>, s: string): s is C => lib.categories.some((c) => c.slug === s);

export const categoryOf = <C extends string>(lib: Library<C>, slug: C) => lib.categories.find((c) => c.slug === slug)!;

export const entriesIn = <C extends string>(lib: Library<C>, category: C) => lib.entries.filter((x) => x.category === category);

export const findEntry = (lib: Library, category: string, slug: string) =>
  lib.entries.find((x) => x.category === category && x.slug === slug);

export const entryBySlug = (lib: Library, slug: string) => lib.entries.find((x) => x.slug === slug);

export const entryHref = (lib: Library, e: LibraryEntry) => `${lib.base}/${e.category}/${e.slug}`;

/** Previous/next across the whole library, in registry order. */
export function neighbours(lib: Library, slug: string) {
  const i = lib.entries.findIndex((x) => x.slug === slug);
  return { prev: i > 0 ? lib.entries[i - 1] : undefined, next: i < lib.entries.length - 1 ? lib.entries[i + 1] : undefined };
}

/** Class sets per hue (kept literal so Tailwind sees them). */
export const hueClass: Record<Hue, { badge: string; ring: string; soft: string; text: string; dot: string }> = {
  indigo: { badge: "bg-indigo-500/12 text-indigo-700 dark:text-indigo-300", ring: "hover:border-indigo-500/50", soft: "from-indigo-500/12", text: "text-indigo-700 dark:text-indigo-300", dot: "bg-indigo-500" },
  emerald: { badge: "bg-emerald-500/12 text-emerald-700 dark:text-emerald-300", ring: "hover:border-emerald-500/50", soft: "from-emerald-500/12", text: "text-emerald-700 dark:text-emerald-300", dot: "bg-emerald-500" },
  sky: { badge: "bg-sky-500/12 text-sky-700 dark:text-sky-300", ring: "hover:border-sky-500/50", soft: "from-sky-500/12", text: "text-sky-700 dark:text-sky-300", dot: "bg-sky-500" },
  amber: { badge: "bg-amber-500/14 text-amber-800 dark:text-amber-300", ring: "hover:border-amber-500/50", soft: "from-amber-500/14", text: "text-amber-800 dark:text-amber-300", dot: "bg-amber-500" },
  rose: { badge: "bg-rose-500/12 text-rose-700 dark:text-rose-300", ring: "hover:border-rose-500/50", soft: "from-rose-500/12", text: "text-rose-700 dark:text-rose-300", dot: "bg-rose-500" },
  violet: { badge: "bg-violet-500/12 text-violet-700 dark:text-violet-300", ring: "hover:border-violet-500/50", soft: "from-violet-500/12", text: "text-violet-700 dark:text-violet-300", dot: "bg-violet-500" },
  teal: { badge: "bg-teal-500/12 text-teal-700 dark:text-teal-300", ring: "hover:border-teal-500/50", soft: "from-teal-500/12", text: "text-teal-700 dark:text-teal-300", dot: "bg-teal-500" },
  orange: { badge: "bg-orange-500/14 text-orange-800 dark:text-orange-300", ring: "hover:border-orange-500/50", soft: "from-orange-500/14", text: "text-orange-800 dark:text-orange-300", dot: "bg-orange-500" },
};
