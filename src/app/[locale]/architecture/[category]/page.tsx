import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { hasLocale } from "next-intl";
import { SectionSkeleton } from "@/components/layout/Skeletons";
import { CategoryView } from "@/components/library/CategoryView";
import { architectureLib, categorySlugs } from "@/content/architecture/registry";
import { categoryOf, isCategory } from "@/content/library";
import { routing } from "@/i18n/routing";
import { pageMetadata } from "@/lib/seo";

type Props = PageProps<"/[locale]/architecture/[category]">;

export function generateStaticParams() {
  return categorySlugs.map((category) => ({ category }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, category } = await params;
  if (!hasLocale(routing.locales, locale) || !isCategory(architectureLib, category)) return {};
  const c = categoryOf(architectureLib, category);
  return pageMetadata({ locale, path: `/architecture/${category}`, title: c.title[locale], description: c.summary[locale] });
}

// `params` is read inside <Suspense> so navigation shows the skeleton at once.
export default function CategoryPage({ params }: Props) {
  return (
    <Suspense fallback={<SectionSkeleton />}>
      <Category params={params} />
    </Suspense>
  );
}

async function Category({ params }: Pick<Props, "params">) {
  const { locale, category } = await params;
  if (!hasLocale(routing.locales, locale) || !isCategory(architectureLib, category)) notFound();
  return <CategoryView lib={architectureLib} category={category} locale={locale} />;
}
