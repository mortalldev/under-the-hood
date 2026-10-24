import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { hasLocale } from "next-intl";
import { SectionSkeleton } from "@/components/layout/Skeletons";
import { CategoryView } from "@/components/library/CategoryView";
import { categoryOf, isCategory } from "@/content/library";
import { categorySlugs, principlesLib } from "@/content/principles/registry";
import { routing } from "@/i18n/routing";
import { pageMetadata } from "@/lib/seo";

type Props = PageProps<"/[locale]/principles/[category]">;

export function generateStaticParams() {
  return categorySlugs.map((category) => ({ category }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, category } = await params;
  if (!hasLocale(routing.locales, locale) || !isCategory(principlesLib, category)) return {};
  const c = categoryOf(principlesLib, category);
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
  if (!hasLocale(routing.locales, locale) || !isCategory(principlesLib, category)) notFound();
  return <CategoryView lib={principlesLib} category={category} locale={locale} />;
}
