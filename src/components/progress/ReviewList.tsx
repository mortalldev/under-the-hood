"use client";

import { useLocale, useTranslations } from "next-intl";
import { useSyncExternalStore } from "react";
import { Link } from "@/i18n/navigation";
import { useProgress } from "@/lib/progress";

export interface ReviewLesson {
  id: string;
  title: string;
  section: string;
  href: string;
}

// Read the clock once per mount instead of during render, so renders stay pure.
const subscribeNow = () => () => {};
const getNow = () => Date.now();
const getServerNow = () => 0;

export function ReviewList({ lessons }: { lessons: ReviewLesson[] }) {
  const t = useTranslations("Progress");
  const locale = useLocale();
  const { data, grade, toggleReview } = useProgress();
  const now = useSyncExternalStore(subscribeNow, getNow, getServerNow);
  const byId = new Map(lessons.map((l) => [l.id, l]));
  const items = Object.entries(data.review)
    .filter(([id]) => byId.has(id))
    .sort((a, b) => a[1].due - b[1].due);

  if (items.length === 0) return <p className="mt-8 rounded-lg border border-dashed border-border p-6 text-fg-muted">{t("reviewEmpty")}</p>;

  const fmt = new Intl.DateTimeFormat(locale === "uz" ? "uz-Latn-UZ" : "en-US", { dateStyle: "medium" });

  return (
    <ul className="mt-8 space-y-3">
      {items.map(([id, item]) => {
        const lesson = byId.get(id) as ReviewLesson;
        const due = now !== 0 && item.due <= now;
        return (
          <li key={id} className={`rounded-xl border p-4 ${due ? "border-accent bg-accent/5" : "border-border"}`}>
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <div>
                <p className="text-xs text-fg-muted">{lesson.section}</p>
                <Link href={lesson.href} className="font-semibold hover:text-accent">
                  {lesson.title}
                </Link>
              </div>
              <span className={`text-xs font-medium ${due ? "text-accent" : "text-fg-muted"}`}>{due ? t("due") : t("dueOn", { date: fmt.format(item.due) })}</span>
            </div>
            <div className="mt-3 flex flex-wrap gap-2 text-sm">
              <button type="button" onClick={() => grade(id, true)} className="rounded-md border border-emerald-500/60 px-3 py-1.5 hover:bg-emerald-500/10">
                {t("remembered")}
              </button>
              <button type="button" onClick={() => grade(id, false)} className="rounded-md border border-amber-500/60 px-3 py-1.5 hover:bg-amber-500/10">
                {t("forgot")}
              </button>
              <button type="button" onClick={() => toggleReview(id)} className="ml-auto text-xs text-fg-muted underline hover:text-fg">
                {t("remove")}
              </button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
