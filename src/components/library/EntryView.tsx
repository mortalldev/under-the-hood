import { getTranslations } from "next-intl/server";
import { IntentLink } from "@/components/layout/IntentLink";
import { LessonTabs } from "@/components/layout/LessonTabs";
import { EntryCard } from "@/components/library/EntryCard";
import { pageOutline } from "@/content/lesson-outline";
import { categoryOf, entryBySlug, entryHref, hueClass, libraryNs, neighbours, type Library, type LibraryEntry } from "@/content/library";
import { loadEntry } from "@/content/load-entry";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { jsonLd } from "@/lib/seo";
import { site } from "@/lib/site";
import { mdxComponents } from "@/mdx-components";

/** Full page of one library entry: header, tab bar, MDX body, related entries and prev/next. */
export async function EntryView({ lib, entry: meta, locale }: { lib: Library; entry: LibraryEntry; locale: Locale }) {
  const [Content, outline, tr, tl] = await Promise.all([
    loadEntry(lib.id, meta.slug, locale),
    pageOutline(lib.id, meta.slug, locale),
    getTranslations(),
    getTranslations("Lesson"),
  ]);
  const ns = libraryNs[lib.id];
  const t = (key: "title" | "tabs" | "related" | "nav") => tr(`${ns}.${key}`);
  const category = categoryOf(lib, meta.category);
  const hue = hueClass[category.hue];
  const { prev, next } = neighbours(lib, meta.slug);
  const related = meta.related.map((s) => entryBySlug(lib, s)).filter((p) => p !== undefined);
  const url = `${site.url}/${locale}${entryHref(lib, meta)}`;

  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "LearningResource",
      name: meta.name,
      description: meta.tagline[locale],
      url,
      inLanguage: locale,
      learningResourceType: "Article",
      timeRequired: `PT${outline.minutes}M`,
      isAccessibleForFree: true,
      publisher: { "@type": "Organization", name: site.name, url: site.url, logo: `${site.url}/icon.svg` },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: t("title"), item: `${site.url}/${locale}${lib.base}` },
        { "@type": "ListItem", position: 2, name: category.title[locale], item: `${site.url}/${locale}${lib.base}/${category.slug}` },
        { "@type": "ListItem", position: 3, name: meta.name, item: url },
      ],
    },
  ];

  return (
    <article className="max-w-5xl">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(structuredData) }} />

      <header className="max-w-[44rem]">
        <nav aria-label={tl("breadcrumb")} className="flex flex-wrap items-center gap-1.5 text-sm text-fg-muted">
          <IntentLink href={lib.base} className="inline-flex min-h-10 items-center hover:text-fg">
            {t("title")}
          </IntentLink>
          <span aria-hidden="true" className="text-fg-subtle">/</span>
          <IntentLink href={`${lib.base}/${category.slug}`} className="inline-flex min-h-10 items-center hover:text-fg">
            {category.title[locale]}
          </IntentLink>
        </nav>
        <div className="mt-2 flex items-center gap-4">
          <span
            aria-hidden="true"
            className={`grid h-16 min-w-16 shrink-0 place-items-center rounded-2xl px-3 font-mono font-bold sm:h-[4.5rem] sm:min-w-[4.5rem] ${meta.short.length > 5 ? "text-base sm:text-lg" : "text-xl sm:text-2xl"} ${hue.badge}`}
          >
            {meta.short}
          </span>
          <div className="min-w-0">
            <h1 className="text-[1.7rem] leading-[1.2] font-semibold tracking-tight text-balance sm:text-[2.125rem]">{meta.name}</h1>
            {meta.expansion && meta.expansion !== meta.name && <p className="mt-1 text-sm text-fg-subtle">{meta.expansion}</p>}
          </div>
        </div>
        <p className="mt-4 text-base leading-relaxed text-fg-muted sm:text-[1.0625rem]">{meta.tagline[locale]}</p>
        <p className="mt-3 text-sm text-fg-subtle">{tl("minutes", { n: outline.minutes })}</p>
      </header>

      <div className="mt-8">
        <LessonTabs items={outline.headings} label={t("tabs")} />
      </div>

      <div className="lesson-body prose mt-6 max-w-none">
        <Content components={mdxComponents} />
      </div>

      {related.length > 0 && (
        <section aria-labelledby="related" className="mt-14 max-w-[44rem] border-t border-border pt-8">
          <h2 id="related" className="text-lg font-semibold">
            {t("related")}
          </h2>
          <ul className="mt-4 grid gap-3">
            {related.map((p) => (
              <li key={p.slug}>
                <EntryCard lib={lib} entry={p} locale={locale} />
              </li>
            ))}
          </ul>
        </section>
      )}

      <nav aria-label={t("nav")} className="mt-8 grid max-w-[44rem] gap-3 sm:grid-cols-2">
        {prev ? (
          <Link prefetch href={entryHref(lib, prev)} className="group rounded-2xl border border-border p-5 transition-colors hover:border-accent/50 hover:bg-surface-1">
            <span className="text-xs font-medium text-fg-subtle">← {tl("prev")}</span>
            <span className="mt-1 block font-semibold group-hover:text-accent">{prev.name}</span>
          </Link>
        ) : (
          <span className="hidden sm:block" />
        )}
        {next && (
          <Link prefetch href={entryHref(lib, next)} className="group rounded-2xl border border-border p-5 text-right transition-colors hover:border-accent/50 hover:bg-surface-1">
            <span className="text-xs font-medium text-fg-subtle">{tl("next")} →</span>
            <span className="mt-1 block font-semibold group-hover:text-accent">{next.name}</span>
          </Link>
        )}
      </nav>
    </article>
  );
}
