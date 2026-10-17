import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { IntentLink } from "@/components/layout/IntentLink";
import { SectionSkeleton } from "@/components/layout/Skeletons";
import { SectionProgress } from "@/components/progress/LessonProgress";
import { isSectionSlug, lessons, sectionSlugs } from "@/content/registry";
import { routing } from "@/i18n/routing";
import { pageMetadata } from "@/lib/seo";

export function generateStaticParams() {
  return sectionSlugs.map((section) => ({ section }));
}

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/learn/[section]">): Promise<Metadata> {
  const { locale, section } = await params;
  if (!isSectionSlug(section) || !hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations("Sections");
  return pageMetadata({ locale, path: `/learn/${section}`, title: t(`${section}.title`), description: t(`${section}.description`) });
}

// See the lesson page: `params` is read inside <Suspense> so navigation into a
// section shows its skeleton immediately instead of waiting on the server.
export default function SectionPage({ params }: PageProps<"/[locale]/learn/[section]">) {
  return (
    <Suspense fallback={<SectionSkeleton />}>
      <Section params={params} />
    </Suspense>
  );
}

async function Section({ params }: Pick<PageProps<"/[locale]/learn/[section]">, "params">) {
  const { locale, section } = await params;
  // `dynamicParams = false` is unavailable with Cache Components, so unknown
  // slugs are rejected at runtime instead.
  if (!hasLocale(routing.locales, locale) || !isSectionSlug(section)) notFound();

  const t = await getTranslations();

  return (
    <>
      <h1 className="text-[1.6rem] font-semibold tracking-tight sm:text-[2rem]">{t(`Sections.${section}.title`)}</h1>
      <p className="mt-2.5 max-w-2xl text-base leading-relaxed text-fg-muted">{t(`Sections.${section}.description`)}</p>
      <SectionProgress ids={lessons[section].map((l) => `${section}/${l.slug}`)} />

      <ol className="mt-8 space-y-2.5">
        {lessons[section].map((lesson, i) => (
          <li key={lesson.slug}>
            <IntentLink
              href={`/learn/${section}/${lesson.slug}`}
              className="group grid grid-cols-[2.25rem_minmax(0,1fr)] gap-3 rounded-2xl border border-border bg-surface-1 p-4 transition-colors hover:border-accent/50 sm:p-5"
            >
              <span className="font-mono text-xs text-fg-subtle">{String(i + 1).padStart(2, "0")}</span>
              <span className="min-w-0">
                <span className="block font-semibold group-hover:text-accent">{lesson.title[locale]}</span>
                <span className="mt-1 block text-[0.94rem] leading-relaxed text-fg-muted">{lesson.summary[locale]}</span>
              </span>
            </IntentLink>
          </li>
        ))}
      </ol>
    </>
  );
}
