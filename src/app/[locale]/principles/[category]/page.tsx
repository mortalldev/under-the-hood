import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { SectionSkeleton } from "@/components/layout/Skeletons";
import { PrincipleCard } from "@/components/principles/PrincipleCard";
import { categorySlugs, getCategory, hueClass, isCategorySlug, principlesIn } from "@/content/principles/registry";
import { routing } from "@/i18n/routing";
import { pageMetadata } from "@/lib/seo";

type Props = PageProps<"/[locale]/principles/[category]">;

export function generateStaticParams() {
  return categorySlugs.map((category) => ({ category }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, category } = await params;
  if (!hasLocale(routing.locales, locale) || !isCategorySlug(category)) return {};
  const c = getCategory(category);
  return pageMetadata({ locale, path: `/principles/${category}`, title: c.title[locale], description: c.summary[locale] });
}

// Like learn/[section]: `params` is read inside <Suspense> so navigation shows
// the skeleton at once instead of waiting on the server.
export default function CategoryPage({ params }: Props) {
  return (
    <Suspense fallback={<SectionSkeleton />}>
      <Category params={params} />
    </Suspense>
  );
}

async function Category({ params }: Pick<Props, "params">) {
  const { locale, category } = await params;
  if (!hasLocale(routing.locales, locale) || !isCategorySlug(category)) notFound();

  const t = await getTranslations("Principles");
  const c = getCategory(category);
  const items = principlesIn(category);

  return (
    <>
      <header className={`rounded-3xl border border-border bg-gradient-to-br ${hueClass[c.hue].soft} to-transparent p-5 sm:p-7`}>
        <p className={`font-mono text-xs font-semibold tracking-wider uppercase ${hueClass[c.hue].text}`}>{t("count", { count: items.length })}</p>
        <h1 className="mt-2 text-[1.7rem] font-semibold tracking-tight sm:text-[2.1rem]">{c.title[locale]}</h1>
        <p className="mt-2.5 max-w-2xl text-base leading-relaxed text-fg-muted">{c.summary[locale]}</p>
        {category === "solid" && (
          <p aria-hidden="true" className="mt-5 flex gap-2 sm:gap-3">
            {items.map((p) => (
              <span key={p.slug} className="grid size-11 place-items-center rounded-xl bg-indigo-500/15 text-xl font-bold text-indigo-700 sm:size-14 sm:text-2xl dark:text-indigo-300">
                {p.short}
              </span>
            ))}
          </p>
        )}
      </header>
      <ol className="mt-8 grid gap-3 xl:grid-cols-2">
        {items.map((p) => (
          <li key={p.slug}>
            <PrincipleCard p={p} locale={locale} />
          </li>
        ))}
      </ol>
    </>
  );
}
