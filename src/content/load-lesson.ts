import type { MDXContent } from "mdx/types";
import type { Locale } from "@/i18n/routing";
import type { SectionSlug } from "./registry";

interface LessonModule {
  default: MDXContent;
}

export async function loadLesson(
  section: SectionSlug,
  lesson: string,
  locale: Locale,
): Promise<MDXContent> {
  const mod: LessonModule = await import(
    `./lessons/${section}/${lesson}/${locale}.mdx`
  );
  return mod.default;
}
