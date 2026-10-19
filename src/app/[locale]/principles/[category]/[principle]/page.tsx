import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { IntentLink } from "@/components/layout/IntentLink";
import { LessonTabs } from "@/components/layout/LessonTabs";
import { LessonSkeleton } from "@/components/layout/Skeletons";
import { PrincipleCard } from "@/components/principles/PrincipleCard";
import { principleOutline } from "@/content/lesson-outline";
import { loadPrinciple } from "@/content/load-principle";
import { getCategory, getPrinciple, hueClass, isCategorySlug, principleBySlug, principleNeighbours, principleParams } from "@/content/principles/registry";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { jsonLd, pageMetadata } from "@/lib/seo";
import { site } from "@/lib/site";
import { mdxComponents } from "@/mdx-components";

type Props = PageProps<"/[locale]/principles/[category]/[principle]">;

export function generateStaticParams() {
  return principleParams();
}

async function resolve(params: Props["params"]) {
  const { locale, category, principle } = await params;
  if (!hasLocale(routing.locales, locale) || !isCategorySlug(category)) return null;
  const meta = getPrinciple(category, principle);
  return meta ? { locale, meta, category: getCategory(category) } : null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const r = await resolve(params);
  if (!r) return {};
  const { locale, meta } = r;
  const title = meta.expansion && meta.expansion !== meta.name ? `${meta.name} (${meta.expansion})` : meta.name;
  return pageMetadata({ locale, path: `/principles/${meta.category}/${meta.slug}`, title, description: meta.tagline[locale], type: "article" });
}

// See the lesson page: `params` is read inside <Suspense> so the skeleton
// shows instantly and prefetched principles render at once.
export default function PrinciplePage({ params }: Props) {
  return (
    <Suspense fallback={<LessonSkeleton />}>
      <Principle params={params} />
    </Suspense>
  );
}

async function Principle({ params }: Pick<Props, "params">) {
  const r = await resolve(params);
  if (!r) notFound();

  const { locale, meta, category } = r;
  const [Content, outline, t, tl] = await Promise.all([
    loadPrinciple(meta.slug, locale),
    principleOutline(meta.slug, locale),
    getTranslations("Principles"),
    getTranslations("Lesson"),
  ]);
  const hue = hueClass[category.hue];
  const { prev, next } = principleNeighbours(meta.slug);
  const related = meta.related.map(principleBySlug).filter((p) => p !== undefined);
  const url = `${site.url}/${locale}/principles/${meta.category}/${meta.slug}`;

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
        { "@type": "ListItem", position: 1, name: t("title"), item: `${site.url}/${locale}/principles` },
        { "@type": "ListItem", position: 2, name: category.title[locale], item: `${site.url}/${locale}/principles/${category.slug}` },
        { "@type": "ListItem", position: 3, name: meta.name, item: url },
      ],
    },
  ];

  return (
    <article className="max-w-5xl">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(structuredData) }} />

      <header className="max-w-[44rem]">
        <nav aria-label={tl("breadcrumb")} className="flex flex-wrap items-center gap-1.5 text-sm text-fg-muted">
          <IntentLink href="/principles" className="inline-flex min-h-10 items-center hover:text-fg">
            {t("title")}
          </IntentLink>
          <span aria-hidden="true" className="text-fg-subtle">/</span>
          <IntentLink href={`/principles/${category.slug}`} className="inline-flex min-h-10 items-center hover:text-fg">
            {category.title[locale]}
          </IntentLink>
        </nav>
        <div className="mt-2 flex items-center gap-4">
          <span aria-hidden="true" className={`grid h-16 min-w-16 shrink-0 place-items-center rounded-2xl px-3 font-mono text-xl font-bold sm:h-[4.5rem] sm:min-w-[4.5rem] sm:text-2xl ${hue.badge}`}>
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
                <PrincipleCard p={p} locale={locale} />
              </li>
            ))}
          </ul>
        </section>
      )}

      <nav aria-label={t("nav")} className="mt-8 grid max-w-[44rem] gap-3 sm:grid-cols-2">
        {prev ? (
          <Link prefetch href={`/principles/${prev.category}/${prev.slug}`} className="group rounded-2xl border border-border p-5 transition-colors hover:border-accent/50 hover:bg-surface-1">
            <span className="text-xs font-medium text-fg-subtle">← {tl("prev")}</span>
            <span className="mt-1 block font-semibold group-hover:text-accent">{prev.name}</span>
          </Link>
        ) : (
          <span className="hidden sm:block" />
        )}
        {next && (
          <Link prefetch href={`/principles/${next.category}/${next.slug}`} className="group rounded-2xl border border-border p-5 text-right transition-colors hover:border-accent/50 hover:bg-surface-1">
            <span className="text-xs font-medium text-fg-subtle">{tl("next")} →</span>
            <span className="mt-1 block font-semibold group-hover:text-accent">{next.name}</span>
          </Link>
        )}
      </nav>
    </article>
  );
}
