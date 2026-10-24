import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { hasLocale } from "next-intl";
import { LessonSkeleton } from "@/components/layout/Skeletons";
import { EntryView } from "@/components/library/EntryView";
import { entryHref, findEntry } from "@/content/library";
import { principlesLib } from "@/content/principles/registry";
import { routing } from "@/i18n/routing";
import { pageMetadata } from "@/lib/seo";

type Props = PageProps<"/[locale]/principles/[category]/[principle]">;

export function generateStaticParams() {
  return principlesLib.entries.map((p) => ({ category: p.category, principle: p.slug }));
}

async function resolve(params: Props["params"]) {
  const { locale, category, principle } = await params;
  if (!hasLocale(routing.locales, locale)) return null;
  const entry = findEntry(principlesLib, category, principle);
  return entry ? { locale, entry } : null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const r = await resolve(params);
  if (!r) return {};
  const { locale, entry } = r;
  const title = entry.expansion && entry.expansion !== entry.name ? `${entry.name} (${entry.expansion})` : entry.name;
  return pageMetadata({ locale, path: entryHref(principlesLib, entry), title, description: entry.tagline[locale], type: "article" });
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
  return <EntryView lib={principlesLib} entry={r.entry} locale={r.locale} />;
}
