"use client";

import { AnimatePresence, motion } from "motion/react";
import type { Tone } from "@/visualizer/core/types";
import { toneBox } from "./tones";

export interface StackItem {
  id: string | number;
  label: string;
  tone?: Tone;
}

/** Vertical LIFO stack, top drawn first. */
export function StackView({ items, label, emptyText = "∅" }: { items: readonly StackItem[]; label?: string; emptyText?: string }) {
  const topFirst = [...items].reverse();
  return (
    <figure className="min-w-28">
      {label && <figcaption className="mb-1.5 text-xs font-medium text-fg-muted">{label}</figcaption>}
      <ol className="flex min-h-12 flex-col gap-1 rounded-md border-x-2 border-b-2 border-border p-1.5">
        <AnimatePresence initial={false}>
          {topFirst.map((item, i) => (
            <motion.li
              layout
              key={item.id}
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: 24 }}
              className={`rounded border px-2 py-1 font-mono text-xs ${toneBox[item.tone ?? (i === 0 ? "active" : "default")]}`}
            >
              {item.label}
            </motion.li>
          ))}
        </AnimatePresence>
        {items.length === 0 && <li className="py-1 text-center text-xs text-fg-subtle">{emptyText}</li>}
      </ol>
    </figure>
  );
}
