"use client";

import { useLocale, useTranslations } from "next-intl";
import { useId, useState, useTransition } from "react";
import { typecheckPuzzle, type TypecheckResult } from "@/app/actions/typecheck";
import { puzzles, type PuzzleId } from "@/content/puzzles";

export function TypePuzzle({ id }: { id: PuzzleId }) {
  const t = useTranslations("Puzzle");
  const locale = useLocale();
  const puzzle = puzzles[id];
  const editorId = useId();
  const [code, setCode] = useState(puzzle.starter);
  const [result, setResult] = useState<TypecheckResult | null>(null);
  const [showSolution, setShowSolution] = useState(false);
  const [pending, startTransition] = useTransition();

  const check = () =>
    startTransition(async () => {
      setResult(await typecheckPuzzle(id, code));
    });

  return (
    <section aria-label={puzzle.title[locale]} className="not-prose my-8 rounded-xl border border-border bg-surface-1 p-4">
      <p className="text-xs font-medium uppercase tracking-wider text-accent">{t("title")}</p>
      <h3 className="mt-1 font-semibold">{puzzle.title[locale]}</h3>
      <p className="mt-1 text-sm text-fg-muted">{puzzle.prompt[locale]}</p>

      <label htmlFor={editorId} className="sr-only">
        {puzzle.title[locale]}
      </label>
      <textarea
        id={editorId}
        value={code}
        onChange={(e) => {
          setCode(e.target.value);
          setResult(null);
        }}
        onKeyDown={(e) => {
          if (e.key === "Tab") {
            e.preventDefault();
            const el = e.currentTarget;
            const { selectionStart: s, selectionEnd: end } = el;
            setCode(code.slice(0, s) + "  " + code.slice(end));
            requestAnimationFrame(() => el.setSelectionRange(s + 2, s + 2));
          }
          if ((e.metaKey || e.ctrlKey) && e.key === "Enter") check();
        }}
        spellCheck={false}
        rows={Math.max(4, code.split("\n").length + 1)}
        className="mt-3 w-full rounded-md border border-border bg-bg p-3 font-mono text-base leading-relaxed outline-none focus:border-accent sm:text-sm"
      />

      <details className="mt-2 text-xs text-fg-muted">
        <summary className="inline-flex min-h-10 cursor-pointer items-center">tests</summary>
        <pre className="mt-2 overflow-x-auto rounded-md bg-bg p-3 font-mono">{puzzle.tests}</pre>
      </details>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button type="button" onClick={check} disabled={pending} className="rounded-md bg-accent px-4 py-2 text-sm font-semibold text-accent-fg disabled:opacity-60">
          {pending ? t("checking") : t("check")}
        </button>
        <button
          type="button"
          onClick={() => {
            setCode(puzzle.starter);
            setResult(null);
          }}
          className="rounded-md border border-border px-3 py-2 text-sm hover:bg-surface-2"
        >
          {t("reset")}
        </button>
        <button type="button" onClick={() => setShowSolution((v) => !v)} className="ml-auto inline-flex min-h-10 items-center text-xs text-fg-muted underline hover:text-fg">
          {t("solution")}
        </button>
      </div>

      <div aria-live="polite" className="mt-3 text-sm">
        {result?.ok && <p className="font-medium text-emerald-700 dark:text-emerald-400">✓ {t("passed")}</p>}
        {result && !result.ok && (
          <div className="rounded-md border border-rose-500/40 bg-rose-500/10 p-3">
            <p className="font-medium text-rose-700 dark:text-rose-300">{t("failed")}</p>
            <ul className="mt-1 list-disc space-y-1 pl-5 font-mono text-xs">
              {result.errors.map((e, i) => (
                <li key={i}>{e}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
      {showSolution && <pre className="mt-3 overflow-x-auto rounded-md border border-border bg-bg p-3 font-mono text-sm">{puzzle.solution}</pre>}
      <p className="mt-3 text-xs text-fg-subtle">{t("limit")}</p>
    </section>
  );
}
