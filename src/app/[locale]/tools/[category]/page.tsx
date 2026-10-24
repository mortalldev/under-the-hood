import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { IntentLink } from "@/components/layout/IntentLink";
import { LessonTabs } from "@/components/layout/LessonTabs";
import { LessonSkeleton } from "@/components/layout/Skeletons";
import { ToolCard } from "@/components/tools/ToolCard";
import { pageOutline } from "@/content/lesson-outline";
import { hueClass } from "@/content/library";
import { loadToolsPage } from "@/content/load-entry";
import { getToolCategory, isToolCategory, toolCategories, toolCategorySlugs, toolsIn } from "@/content/tools/registry";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { pageMetadata } from "@/lib/seo";
import { mdxComponents } from "@/mdx-components";

type Props = PageProps<"/[locale]/tools/[category]">;

export function generateStaticParams() {
  return toolCategorySlugs.map((category) => ({ category }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, category } = await params;
  if (!hasLocale(routing.locales, locale) || !isToolCategory(category)) return {};
  const c = getToolCategory(category);
  return pageMetadata({ locale, path: `/tools/${category}`, title: c.title[locale], description: c.summary[locale] });
}

// `params` is read inside <Suspense> so navigation shows the skeleton at once.
export default function ToolCategoryPage({ params }: Props) {
  return (
    <Suspense fallback={<LessonSkeleton />}>
      <ToolCategory params={params} />
    </Suspense>
  );
}

async function ToolCategory({ params }: Pick<Props, "params">) {
  const { locale, category } = await params;
  if (!hasLocale(routing.locales, locale) || !isToolCategory(category)) notFound();

  const [t, tl, Content, outline] = await Promise.all([
    getTranslations("Tools"),
    getTranslations("Lesson"),
    loadToolsPage(category, locale),
    pageOutline("tools", category, locale),
  ]);
  const c = getToolCategory(category);
  const items = toolsIn(category);
  const i = toolCategories.indexOf(c);
  const prev = toolCategories[i - 1];
  const next = toolCategories[i + 1];

  return (
    <article className="max-w-5xl">
      <header className={`rounded-3xl border border-border bg-gradient-to-br ${hueClass[c.hue].soft} to-transparent p-5 sm:p-7`}>
        <nav aria-label={tl("breadcrumb")} className="text-sm text-fg-muted">
          <IntentLink href="/tools" className="inline-flex min-h-10 items-center hover:text-fg">
            {t("title")}
          </IntentLink>
        </nav>
        <h1 className="text-[1.7rem] font-semibold tracking-tight sm:text-[2.1rem]">{c.title[locale]}</h1>
        <p className="mt-2.5 max-w-2xl text-base leading-relaxed text-fg-muted">{c.summary[locale]}</p>
        <p className={`mt-4 font-mono text-xs font-semibold tracking-wider uppercase ${hueClass[c.hue].text}`}>{t("count", { count: items.length })}</p>
      </header>

      <ul className="mt-8 grid gap-4 xl:grid-cols-2">
        {items.map((tool) => (
          <li key={tool.slug} className="min-w-0">
            <ToolCard tool={tool} locale={locale} pick={tool.slug === c.pick} />
          </li>
        ))}
      </ul>

      <h2 className="mt-14 text-xl font-semibold">{t("guide")}</h2>
      <div className="mt-4">
        <LessonTabs items={outline.headings} label={t("tabs")} />
      </div>
      <div className="lesson-body prose mt-6 max-w-none">
        <Content components={mdxComponents} />
      </div>

      <nav aria-label={t("nav")} className="mt-12 grid max-w-[44rem] gap-3 sm:grid-cols-2">
        {prev ? (
          <Link prefetch href={`/tools/${prev.slug}`} className="group rounded-2xl border border-border p-5 transition-colors hover:border-accent/50 hover:bg-surface-1">
            <span className="text-xs font-medium text-fg-subtle">← {tl("prev")}</span>
            <span className="mt-1 block font-semibold group-hover:text-accent">{prev.title[locale]}</span>
          </Link>
        ) : (
          <span className="hidden sm:block" />
        )}
        {next && (
          <Link prefetch href={`/tools/${next.slug}`} className="group rounded-2xl border border-border p-5 text-right transition-colors hover:border-accent/50 hover:bg-surface-1">
            <span className="text-xs font-medium text-fg-subtle">{tl("next")} →</span>
            <span className="mt-1 block font-semibold group-hover:text-accent">{next.title[locale]}</span>
          </Link>
        )}
      </nav>
    </article>
  );
}
