import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { hasLocale } from "next-intl";
import { LessonSkeleton } from "@/components/layout/Skeletons";
import { EntryView } from "@/components/library/EntryView";
import { gitLib } from "@/content/git/registry";
import { entryHref, findEntry } from "@/content/library";
import { routing } from "@/i18n/routing";
import { pageMetadata } from "@/lib/seo";

type Props = PageProps<"/[locale]/git/[category]/[topic]">;

export function generateStaticParams() {
  return gitLib.entries.map((e) => ({ category: e.category, topic: e.slug }));
}

async function resolve(params: Props["params"]) {
  const { locale, category, topic } = await params;
  if (!hasLocale(routing.locales, locale)) return null;
  const entry = findEntry(gitLib, category, topic);
  return entry ? { locale, entry } : null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const r = await resolve(params);
  if (!r) return {};
  const { locale, entry } = r;
  const title = entry.expansion && entry.expansion !== entry.name ? `${entry.name} (${entry.expansion})` : entry.name;
  return pageMetadata({ locale, path: entryHref(gitLib, entry), title, description: entry.tagline[locale], type: "article" });
}

// `params` is read inside <Suspense> so the skeleton shows instantly.
export default function TopicPage({ params }: Props) {
  return (
    <Suspense fallback={<LessonSkeleton />}>
      <Topic params={params} />
    </Suspense>
  );
}

async function Topic({ params }: Pick<Props, "params">) {
  const r = await resolve(params);
  if (!r) notFound();
  return <EntryView lib={gitLib} entry={r.entry} locale={r.locale} />;
}
