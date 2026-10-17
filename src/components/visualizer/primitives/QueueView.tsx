"use client";

import { AnimatePresence, motion } from "motion/react";
import type { Tone } from "@/visualizer/core/types";
import { toneBox } from "./tones";

export interface QueueItem {
  id: string | number;
  label: string;
  tone?: Tone;
}

/** Horizontal FIFO queue: front on the left. */
export function QueueView({ items, label, emptyText = "∅" }: { items: readonly QueueItem[]; label?: string; emptyText?: string }) {
  return (
    <figure className="min-w-0">
      {label && <figcaption className="mb-1.5 text-xs font-medium text-fg-muted">{label}</figcaption>}
      <ol className="flex min-h-11 flex-wrap items-center gap-1 rounded-md border-y-2 border-border px-1.5 py-1.5">
        <AnimatePresence initial={false}>
          {items.map((item) => (
            <motion.li
              layout
              key={item.id}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              className={`rounded border px-2 py-1 font-mono text-xs ${toneBox[item.tone ?? "default"]}`}
            >
              {item.label}
            </motion.li>
          ))}
        </AnimatePresence>
        {items.length === 0 && <li className="px-1 text-xs text-fg-subtle">{emptyText}</li>}
      </ol>
    </figure>
  );
}
