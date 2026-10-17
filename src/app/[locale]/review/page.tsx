import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { ReviewList, type ReviewLesson } from "@/components/progress/ReviewList";
import { lessonSequence } from "@/content/registry";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Progress");
  // Personal, browser-only list: nothing for search engines to index.
  return { title: t("reviewTitle"), robots: { index: false, follow: true } };
}

export default async function ReviewPage() {
  const t = await getTranslations();
  const locale = await getLocale();
  const lessons: ReviewLesson[] = lessonSequence().map(({ section, lesson }) => ({
    id: `${section}/${lesson.slug}`,
    title: lesson.title[locale],
    section: t(`Sections.${section}.title`),
    href: `/learn/${section}/${lesson.slug}`,
  }));

  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-[1.6rem] font-semibold tracking-tight sm:text-[2rem]">{t("Progress.reviewTitle")}</h1>
      <p className="mt-3 text-fg-muted">{t("Progress.reviewLead")}</p>
      <ReviewList lessons={lessons} />
    </main>
  );
}
