"use client";

import { useTranslations } from "next-intl";
import { useId, useState } from "react";

export interface QuizQuestion {
  q: string;
  options: string[];
  /** Index of the correct option. */
  answer: number;
  explain: string;
}

/** Multiple-choice self-check. Content comes from MDX in the page's language. */
export function Quiz({ questions }: { questions: QuizQuestion[] }) {
  const t = useTranslations("Quiz");
  const base = useId();
  const [picked, setPicked] = useState<(number | null)[]>(() => questions.map(() => null));
  const [checked, setChecked] = useState(false);
  const correct = questions.filter((q, i) => picked[i] === q.answer).length;

  return (
    <section aria-label={t("title")} className="not-prose my-8 rounded-2xl border border-border bg-surface-1 p-4 sm:p-6">
      <h3 className="text-base font-semibold">{t("title")}</h3>
      <ol className="mt-3 space-y-5">
        {questions.map((q, i) => (
          <li key={i}>
            <fieldset>
              <legend className="max-w-full text-[0.98rem] leading-relaxed font-medium [overflow-wrap:anywhere]">
                <span className="mr-1 text-fg-subtle">{i + 1}.</span>
                {q.q}
              </legend>
              <div className="mt-2 grid gap-1.5">
                {q.options.map((o, k) => {
                  const isPicked = picked[i] === k;
                  const state = checked ? (k === q.answer ? "right" : isPicked ? "wrong" : "idle") : isPicked ? "picked" : "idle";
                  return (
                    <label
                      key={k}
                      className={`flex min-h-11 cursor-pointer items-start gap-3 rounded-xl border px-3.5 py-2.5 text-[0.95rem] transition-colors ${
                        state === "right" ? "border-emerald-500 bg-emerald-500/10" : state === "wrong" ? "border-rose-500 bg-rose-500/10" : state === "picked" ? "border-accent bg-accent/10" : "border-border bg-bg hover:border-fg-subtle"
                      }`}
                    >
                      <input
                        type="radio"
                        name={`${base}-${i}`}
                        checked={isPicked}
                        onChange={() => {
                          setPicked(picked.map((p, j) => (j === i ? k : p)));
                          setChecked(false);
                        }}
                        className="mt-0.5 size-4 shrink-0 accent-[var(--accent)]"
                      />
                      <span className="min-w-0 [overflow-wrap:anywhere]">{o}</span>
                    </label>
                  );
                })}
              </div>
              {checked && (
                <p className={`mt-2 text-sm ${picked[i] === q.answer ? "text-emerald-700 dark:text-emerald-400" : "text-rose-700 dark:text-rose-400"}`}>
                  <strong>{picked[i] === q.answer ? t("correct") : t("incorrect")}.</strong> <span className="text-fg-muted">{q.explain}</span>
                </p>
              )}
            </fieldset>
          </li>
        ))}
      </ol>
      <div className="mt-4 flex items-center gap-3">
        <button type="button" onClick={() => setChecked(true)} disabled={picked.some((p) => p === null)} className="min-h-11 rounded-xl bg-accent px-5 py-2 text-sm font-semibold text-accent-fg transition-opacity hover:opacity-90 disabled:opacity-40">
          {t("check")}
        </button>
        {checked && (
          <p className="text-sm font-medium" aria-live="polite">
            {t("score", { correct, total: questions.length })}
          </p>
        )}
      </div>
    </section>
  );
}
