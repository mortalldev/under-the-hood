import { readFile } from "node:fs/promises";
import path from "node:path";
import GithubSlugger from "github-slugger";
import { cacheLife } from "next/cache";
import type { Locale } from "@/i18n/routing";
import type { SectionSlug } from "./registry";

export interface OutlineItem {
  id: string;
  title: string;
}

export interface LessonOutline {
  headings: OutlineItem[];
  /** Estimated reading time for the prose (code and components excluded). */
  minutes: number;
}

/**
 * Reads the lesson's MDX source and returns its `##` headings with the same
 * ids rehype-slug assigns, plus a reading-time estimate. Runs at build time
 * (every lesson is prerendered), so the tab bar ships in the static HTML.
 */
export async function lessonOutline(section: SectionSlug, lesson: string, locale: Locale): Promise<LessonOutline> {
  "use cache";
  cacheLife("max");
  const file = path.join(process.cwd(), "src/content/lessons", section, lesson, `${locale}.mdx`);
  return outlineOf(await readFile(file, "utf8"));
}

/** Same as `lessonOutline` for a principle page (`content/principles/<slug>/<locale>.mdx`). */
export async function principleOutline(slug: string, locale: Locale): Promise<LessonOutline> {
  "use cache";
  cacheLife("max");
  const file = path.join(process.cwd(), "src/content/principles", slug, `${locale}.mdx`);
  return outlineOf(await readFile(file, "utf8"));
}

function outlineOf(src: string): LessonOutline {
  const slugger = new GithubSlugger();
  const headings: OutlineItem[] = [];
  let inFence = false;
  let prose = "";

  for (const line of src.split("\n")) {
    if (/^```/.test(line)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;
    // rehype-slug numbers duplicates across all heading levels, so feed every heading.
    const heading = /^(#{1,6})\s+(.+?)\s*$/.exec(line);
    if (heading) {
      const text = heading[2].replace(/`/g, "");
      const id = slugger.slug(text);
      if (heading[1].length === 2) headings.push({ id, title: text });
      continue;
    }
    if (!line.startsWith("<") && !line.startsWith("import ")) prose += ` ${line}`;
  }

  const words = prose.split(/\s+/).filter(Boolean).length;
  return { headings, minutes: Math.max(3, Math.round(words / 180)) };
}
