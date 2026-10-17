"use client";

import { AnimatePresence, motion } from "motion/react";
import type { Tone } from "@/visualizer/core/types";
import { toneBox } from "./tones";

export interface MapEntry {
  key: string;
  value: string;
  tone?: Tone;
}

/** Hash map / set contents as key → value chips. */
export function MapView({ entries, label, emptyText = "{}" }: { entries: readonly MapEntry[]; label?: string; emptyText?: string }) {
  return (
    <figure className="min-w-0">
      {label && <figcaption className="mb-1.5 text-xs font-medium text-fg-muted">{label}</figcaption>}
      <ul className="flex min-h-9 flex-wrap gap-1 font-mono text-xs">
        <AnimatePresence initial={false}>
          {entries.map((e) => (
            <motion.li
              layout
              key={e.key}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className={`rounded border px-2 py-1 ${toneBox[e.tone ?? "default"]}`}
            >
              {e.key}
              <span className="mx-1 text-fg-subtle">→</span>
              {e.value}
            </motion.li>
          ))}
        </AnimatePresence>
        {entries.length === 0 && <li className="text-fg-subtle">{emptyText}</li>}
      </ul>
    </figure>
  );
}
