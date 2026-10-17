"use client";

import { AnimatePresence, motion } from "motion/react";

/** Ordered output: console lines, traversal order, emitted events. */
export function TimelineView({
  entries,
  label,
  emptyText = "—",
  highlightLast = true,
}: {
  entries: readonly string[];
  label?: string;
  emptyText?: string;
  highlightLast?: boolean;
}) {
  return (
    <figure className="min-w-0">
      {label && <figcaption className="mb-1.5 text-xs font-medium text-fg-muted">{label}</figcaption>}
      <ol className="flex min-h-9 flex-wrap items-center gap-1 font-mono text-xs">
        <AnimatePresence initial={false}>
          {entries.map((e, i) => (
            <motion.li
              key={`${i}-${e}`}
              layout
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`flex items-center gap-1 rounded border px-2 py-1 ${
                highlightLast && i === entries.length - 1
                  ? "border-emerald-500 bg-emerald-500/15"
                  : "border-border bg-bg"
              }`}
            >
              <span className="text-fg-subtle">{i + 1}.</span>
              {e}
            </motion.li>
          ))}
        </AnimatePresence>
        {entries.length === 0 && <li className="text-fg-subtle">{emptyText}</li>}
      </ol>
    </figure>
  );
}
