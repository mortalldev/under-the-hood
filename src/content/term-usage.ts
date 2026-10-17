import { readFile } from "node:fs/promises";
import path from "node:path";
import { cacheLife } from "next/cache";
import { lessons, sectionSlugs, type SectionSlug } from "./registry";

export interface TermUsage {
  section: SectionSlug;
  slug: string;
}

/**
 * Which lessons use each glossary term (`<Term id="…">`), in course order.
 * Read from the English MDX at build time — both locales use the same terms,
 * which `npm run check:content` enforces. Cached (`use cache`) so the read
 * becomes part of the static page under Cache Components.
 */
export async function termUsage(): Promise<Record<string, TermUsage[]>> {
  "use cache";
  cacheLife("max"); // lesson files only change with a new deploy
  const usage = new Map<string, TermUsage[]>();
  const all = sectionSlugs.flatMap((section) => lessons[section].map((l) => ({ section, slug: l.slug })));
  const sources = await Promise.all(
    all.map((l) => readFile(path.join(process.cwd(), "src/content/lessons", l.section, l.slug, "en.mdx"), "utf8")),
  );
  sources.forEach((src, i) => {
    const ids = new Set([...src.matchAll(/<Term id="([^"]+)"/g)].map((m) => m[1]));
    for (const id of ids) {
      const list = usage.get(id) ?? [];
      list.push(all[i]);
      usage.set(id, list);
    }
  });
  return Object.fromEntries(usage);
}
