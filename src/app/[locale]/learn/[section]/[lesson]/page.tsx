import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { IntentLink } from "@/components/layout/IntentLink";
import { LessonTabs } from "@/components/layout/LessonTabs";
import { LessonSkeleton } from "@/components/layout/Skeletons";
import { LessonProgress } from "@/components/progress/LessonProgress";
import { lessonOutline } from "@/content/lesson-outline";
import { loadLesson } from "@/content/load-lesson";
import { plain } from "@/content/plain";
import { getLesson, isSectionSlug, lessons, neighbours, readyLessonParams } from "@/content/registry";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { jsonLd, pageMetadata } from "@/lib/seo";
import { site } from "@/lib/site";
import { mdxComponents } from "@/mdx-components";

type Props = PageProps<"/[locale]/learn/[section]/[lesson]">;

export function generateStaticParams() {
  return readyLessonParams();
}

async function resolve(params: Props["params"]) {
  const { locale, section, lesson } = await params;
  if (!hasLocale(routing.locales, locale) || !isSectionSlug(section)) return null;
  const meta = getLesson(section, lesson);
  if (!meta) return null;
  return { locale, section, meta };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolved = await resolve(params);
  if (!resolved) return {};
  const { locale, section, meta } = resolved;
  return pageMetadata({ locale, path: `/learn/${section}/${meta.slug}`, title: meta.title[locale], description: meta.summary[locale], type: "article" });
}

// `params` is URL data: reading it outside <Suspense> would make every client
// navigation wait for the server. With the boundary, the App Shell shows the
// skeleton instantly, and links that prefetched this lesson render it at once.
export default function LessonPage({ params }: Props) {
  return (
    <Suspense fallback={<LessonSkeleton />}>
      <Lesson params={params} />
    </Suspense>
  );
}

async function Lesson({ params }: Pick<Props, "params">) {
  const resolved = await resolve(params);
  if (!resolved) notFound();

  const { locale, section, meta } = resolved;
  const [Content, outline, t] = await Promise.all([
    loadLesson(section, meta.slug, locale),
    lessonOutline(section, meta.slug, locale),
    getTranslations(),
  ]);
  const sectionTitle = t(`Sections.${section}.title`);
  const { prev, next } = neighbours(section, meta.slug);
  const index = lessons[section].findIndex((l) => l.slug === meta.slug);
  const intro = plain[`${section}/${meta.slug}`]?.[locale];
  const url = `${site.url}/${locale}/learn/${section}/${meta.slug}`;

  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "LearningResource",
      name: meta.title[locale],
      description: meta.summary[locale],
      url,
      inLanguage: locale,
      learningResourceType: "Lesson",
      educationalLevel: "Intermediate to advanced",
      timeRequired: `PT${outline.minutes}M`,
      isAccessibleForFree: true,
      isPartOf: { "@type": "Course", name: sectionTitle, url: `${site.url}/${locale}/learn/${section}` },
      publisher: { "@type": "Organization", name: site.name, url: site.url, logo: `${site.url}/icon.svg` },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: t("Nav.learn"), item: `${site.url}/${locale}/learn` },
        { "@type": "ListItem", position: 2, name: sectionTitle, item: `${site.url}/${locale}/learn/${section}` },
        { "@type": "ListItem", position: 3, name: meta.title[locale], item: url },
      ],
    },
  ];

  return (
    <article className="max-w-5xl">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(structuredData) }} />

      <header className="max-w-[44rem]">
        <nav aria-label={t("Lesson.breadcrumb")} className="flex flex-wrap items-center gap-1.5 text-sm text-fg-muted">
          <IntentLink href="/learn" className="inline-flex min-h-10 items-center hover:text-fg">
            {t("Nav.learn")}
          </IntentLink>
          <span aria-hidden="true" className="text-fg-subtle">/</span>
          <IntentLink href={`/learn/${section}`} className="inline-flex min-h-10 items-center hover:text-fg">
            {sectionTitle}
          </IntentLink>
        </nav>
        <h1 className="mt-1 text-[1.7rem] leading-[1.2] font-semibold tracking-tight text-balance sm:text-[2.125rem]">
          {meta.title[locale]}
        </h1>
        <p className="mt-3 text-base leading-relaxed text-fg-muted sm:text-[1.0625rem]">{meta.summary[locale]}</p>
        <p className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-fg-subtle">
          <span>{t("Lesson.lessonOf", { n: index + 1, total: lessons[section].length })}</span>
          <span aria-hidden="true">·</span>
          <span>{t("Lesson.minutes", { n: outline.minutes })}</span>
        </p>
      </header>

      {intro && (
        <aside className="mt-8 max-w-[44rem] rounded-2xl border border-accent/20 bg-accent/[0.06] p-5 sm:p-6 dark:bg-accent/[0.08]">
          <p className="flex items-center gap-2 text-sm font-semibold text-accent">
            <svg aria-hidden="true" viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.3 1 2.3h6c0-1 .4-1.8 1-2.3A7 7 0 0 0 12 2z" />
            </svg>
            {t("Lesson.plainTitle")}
          </p>
          <p className="mt-2 text-[1.0625rem] leading-[1.75] text-fg">{intro}</p>
        </aside>
      )}

      <div className="mt-8">
        <LessonTabs items={outline.headings} label={t("Lesson.sectionsTabs")} />
      </div>

      <div className="lesson-body prose mt-6 max-w-none">
        <Content components={mdxComponents} />
      </div>

      <div className="mt-14 max-w-[44rem] border-t border-border pt-6">
        <LessonProgress id={`${section}/${meta.slug}`} />
      </div>

      <nav aria-label={t("Nav.lessonNav")} className="mt-8 grid max-w-[44rem] gap-3 sm:grid-cols-2">
        {prev ? (
          <Link prefetch href={`/learn/${prev.section}/${prev.lesson.slug}`} className="group rounded-2xl border border-border p-5 transition-colors hover:border-accent/50 hover:bg-surface-1">
            <span className="text-xs font-medium text-fg-subtle">← {t("Lesson.prev")}</span>
            <span className="mt-1 block font-semibold group-hover:text-accent">{prev.lesson.title[locale]}</span>
          </Link>
        ) : (
          <span className="hidden sm:block" />
        )}
        {next && (
          <Link prefetch href={`/learn/${next.section}/${next.lesson.slug}`} className="group rounded-2xl border border-border p-5 text-right transition-colors hover:border-accent/50 hover:bg-surface-1">
            <span className="text-xs font-medium text-fg-subtle">{t("Lesson.next")} →</span>
            <span className="mt-1 block font-semibold group-hover:text-accent">{next.lesson.title[locale]}</span>
          </Link>
        )}
      </nav>
    </article>
  );
}
