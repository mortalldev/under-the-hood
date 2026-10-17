"use client";

import { useTranslations } from "next-intl";
import { useProgress } from "@/lib/progress";

export function LessonProgress({ id }: { id: string }) {
  const t = useTranslations("Progress");
  const { isDone, inReview, toggleDone, toggleReview } = useProgress();
  const done = isDone(id);
  const review = inReview(id);

  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        aria-pressed={done}
        onClick={() => toggleDone(id)}
        className={`min-h-11 rounded-xl border px-4 py-2 text-sm font-semibold transition-colors ${done ? "border-emerald-500/50 bg-emerald-500/12 text-emerald-700 dark:text-emerald-300" : "border-border hover:bg-surface-2"}`}
      >
        {done ? `✓ ${t("done")}` : t("markDone")}
      </button>
      <button
        type="button"
        aria-pressed={review}
        onClick={() => toggleReview(id)}
        className={`min-h-11 rounded-xl border px-4 py-2 text-sm font-semibold transition-colors ${review ? "border-accent/50 bg-accent-soft text-accent" : "border-border hover:bg-surface-2"}`}
      >
        {review ? `↻ ${t("inReview")}` : t("addReview")}
      </button>
    </div>
  );
}


export function SectionProgress({ ids }: { ids: string[] }) {
  const t = useTranslations("Progress");
  const { data } = useProgress();
  const done = ids.filter((id) => data.done.includes(id)).length;
  return (
    <div className="mt-4 max-w-sm">
      <p className="text-xs text-fg-muted">{t("learnedCount", { done, total: ids.length })}</p>
      <div className="mt-1 h-1.5 rounded bg-surface-2" role="progressbar" aria-valuemin={0} aria-valuemax={ids.length} aria-valuenow={done}>
        <div className="h-full rounded bg-emerald-500 transition-all" style={{ width: `${ids.length ? (done / ids.length) * 100 : 0}%` }} />
      </div>
    </div>
  );
}
