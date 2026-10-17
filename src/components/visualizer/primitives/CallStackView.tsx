"use client";

import { AnimatePresence, motion } from "motion/react";

export interface Frame {
  id: string | number;
  title: string;
  detail?: string;
}

/** Call stack: newest frame on top and highlighted. */
export function CallStackView({ frames, label, emptyText = "∅" }: { frames: readonly Frame[]; label?: string; emptyText?: string }) {
  const topFirst = [...frames].reverse();
  return (
    <figure className="min-w-40">
      {label && <figcaption className="mb-1.5 text-xs font-medium text-fg-muted">{label}</figcaption>}
      <ol className="flex min-h-14 flex-col gap-1 rounded-md border border-border bg-bg p-1.5">
        <AnimatePresence initial={false}>
          {topFirst.map((f, i) => (
            <motion.li
              layout
              key={f.id}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`rounded border px-2 py-1 text-xs ${i === 0 ? "border-accent bg-accent/15" : "border-border bg-surface-1"}`}
            >
              <span className="font-mono font-semibold">{f.title}</span>
              {f.detail && <span className="ml-2 font-mono text-fg-muted">{f.detail}</span>}
            </motion.li>
          ))}
        </AnimatePresence>
        {frames.length === 0 && <li className="py-2 text-center text-xs text-fg-subtle">{emptyText}</li>}
      </ol>
    </figure>
  );
}
