import type { ReactNode } from "react";

/**
 * Interview question with a collapsible model answer — try to answer out loud
 * before opening it (active recall). Works without JavaScript.
 */
export function QA({ q, level, children }: { q: string; level?: "junior" | "mid" | "senior"; children: ReactNode }) {
  return (
    <details className="group my-3 rounded-2xl border border-border bg-surface-1 transition-colors open:bg-bg">
      <summary className="flex cursor-pointer list-none items-start gap-3 px-5 py-4 text-[1rem] font-medium [&::-webkit-details-marker]:hidden">
        <span aria-hidden="true" className="mt-0.5 text-accent transition-transform group-open:rotate-90 motion-reduce:transition-none">
          ▸
        </span>
        <span className="min-w-0 flex-1 [overflow-wrap:anywhere]">{q}</span>
        {level && <span className="shrink-0 rounded-full bg-surface-2 px-2 py-0.5 font-mono text-[0.65rem] uppercase text-fg-muted">{level}</span>}
      </summary>
      <div className="border-t border-border px-5 pb-2 [&>*:first-child]:mt-4">{children}</div>
    </details>
  );
}
