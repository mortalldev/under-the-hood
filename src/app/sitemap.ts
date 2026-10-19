import type { MetadataRoute } from "next";
import { categorySlugs, principles } from "@/content/principles/registry";
import { lessons, sectionSlugs } from "@/content/registry";
import { routing } from "@/i18n/routing";
import { CONTENT_UPDATED, languageAlternates, localePath } from "@/lib/seo";
import { site } from "@/lib/site";

/** Every public page in every language, with hreflang alternates. */
export default function sitemap(): MetadataRoute.Sitemap {
  const paths: { path: string; priority: number }[] = [
    { path: "", priority: 1 },
    { path: "/learn", priority: 0.9 },
    { path: "/resources", priority: 0.5 },
    { path: "/glossary", priority: 0.5 },
    { path: "/principles", priority: 0.8 },
    ...categorySlugs.map((c) => ({ path: `/principles/${c}`, priority: 0.7 })),
    ...principles.map((p) => ({ path: `/principles/${p.category}/${p.slug}`, priority: 0.7 })),
    ...sectionSlugs.map((s) => ({ path: `/learn/${s}`, priority: 0.8 })),
    ...sectionSlugs.flatMap((s) =>
      lessons[s].map((l) => ({ path: `/learn/${s}/${l.slug}`, priority: 0.7 })),
    ),
  ];
  const abs = (p: string) => `${site.url}${p}`;
  return paths.flatMap(({ path, priority }) =>
    routing.locales.map((locale) => ({
      url: abs(localePath(locale, path)),
      lastModified: CONTENT_UPDATED,
      changeFrequency: "monthly" as const,
      priority,
      alternates: {
        languages: Object.fromEntries(Object.entries(languageAlternates(path)).map(([k, v]) => [k, abs(v)])),
      },
    })),
  );
}
