import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { GlossaryBrowser, type GlossaryItem } from "@/components/GlossaryBrowser";
import { glossary, type GlossaryCategory } from "@/content/glossary";
import { getLesson } from "@/content/registry";
import { termUsage } from "@/content/term-usage";
import type { Locale } from "@/i18n/routing";
import { jsonLd, pageMetadata } from "@/lib/seo";
import { site } from "@/lib/site";

const categoryOrder: GlossaryCategory[] = ["learning", "dsa", "javascript", "typescript", "react", "nextjs", "nodejs", "web", "system-design", "interview"];

export async function generateMetadata(): Promise<Metadata> {
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("Glossary");
  return pageMetadata({ locale, path: "/glossary", title: t("title"), description: t("lead") });
}

export default async function GlossaryPage() {
  const [t, locale, usage] = await Promise.all([getTranslations("Glossary"), getLocale() as Promise<Locale>, termUsage()]);

  const items: GlossaryItem[] = Object.entries(glossary)
    .map(([id, g]) => ({
      id,
      term: g.term,
      category: g.category,
      definition: g.definition[locale],
      lessons: (usage[id] ?? []).map(({ section, slug }) => ({
        href: `/learn/${section}/${slug}`,
        title: getLesson(section, slug)?.title[locale] ?? slug,
      })),
    }))
    .sort((a, b) => a.term.localeCompare(b.term, "en", { sensitivity: "base" }));

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "DefinedTermSet",
    name: t("title"),
    url: `${site.url}/${locale}/glossary`,
    inLanguage: locale,
    hasDefinedTerm: items.map((it) => ({ "@type": "DefinedTerm", name: it.term, description: it.definition, url: `${site.url}/${locale}/glossary#${it.id}` })),
  };

  return (
    <main className="mx-auto max-w-5xl px-4 py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(structuredData) }} />
      <h1 className="text-[1.6rem] font-semibold tracking-tight sm:text-[2rem]">{t("title")}</h1>
      <p className="mt-3 max-w-2xl text-base leading-relaxed text-fg-muted">{t("lead")}</p>
      <GlossaryBrowser
        items={items}
        categoryOrder={categoryOrder}
        labels={{
          search: t("search"),
          all: t("all"),
          usedIn: t("usedIn"),
          noResults: t("noResults"),
          jump: t("jump"),
          more: t.raw("more") as string,
          count: t.raw("count") as string,
          categories: Object.fromEntries(categoryOrder.map((c) => [c, t(`categories.${c}`)])),
        }}
      />
    </main>
  );
}
