"use client";

import { motion } from "motion/react";
import type { Tone } from "@/visualizer/core/types";
import { PointerView, type Pointer } from "./PointerView";
import { toneBox } from "./tones";

export interface ArrayViewProps {
  items: readonly (string | number | null)[];
  tones?: Partial<Record<number, Tone>>;
  pointers?: readonly Pointer[];
  label?: string;
  showIndex?: boolean;
  /** Stable identity per cell for move animations (defaults to index). */
  keys?: readonly (string | number)[];
}

export function ArrayView({ items, tones = {}, pointers = [], label, showIndex = true, keys }: ArrayViewProps) {
  const hasEndPointer = pointers.some((p) => p.index === items.length);
  const columns = items.length + (hasEndPointer ? 1 : 0);

  return (
    <figure className="min-w-max">
      {label && <figcaption className="mb-1.5 text-xs font-medium text-fg-muted">{label}</figcaption>}
      <div className="flex gap-1 sm:gap-1.5" role="list">
        {items.map((item, i) => (
          <motion.div
            layout
            key={keys?.[i] ?? i}
            role="listitem"
            aria-label={`[${i}] ${item ?? "∅"}`}
            className={`grid size-9 place-items-center rounded-md border font-mono text-sm transition-colors max-[22rem]:size-8 sm:size-10 ${toneBox[tones[i] ?? "default"]}`}
          >
            {item ?? <span className="text-fg-subtle">·</span>}
          </motion.div>
        ))}
        {hasEndPointer && (
          <div aria-hidden="true" className="grid size-9 place-items-center rounded-md border border-dashed border-border text-xs text-fg-subtle max-[22rem]:size-8 sm:size-10">
            end
          </div>
        )}
      </div>
      {showIndex && (
        <div aria-hidden="true" className="mt-1 flex gap-1 sm:gap-1.5">
          {Array.from({ length: items.length }, (_, i) => (
            <span key={i} className="w-9 text-center max-[22rem]:w-8 sm:w-10 font-mono text-[0.65rem] text-fg-subtle">
              {i}
            </span>
          ))}
        </div>
      )}
      {pointers.length > 0 && <PointerView pointers={pointers} columns={columns} />}
    </figure>
  );
}
