"use client";

import { motion } from "motion/react";
import type { Tone } from "@/visualizer/core/types";
import { toneText } from "./tones";

export interface Pointer {
  index: number;
  label: string;
  tone?: Tone;
}

/** Labels under an ArrayView column; they glide between cells as indices change. */
export function PointerView({ pointers, columns }: { pointers: readonly Pointer[]; columns: number }) {
  return (
    <div className="mt-1 flex gap-1 sm:gap-1.5">
      {Array.from({ length: columns }, (_, col) => (
        <div key={col} className="flex w-9 flex-col items-center gap-0.5 max-[22rem]:w-8 sm:w-10">
          {pointers
            .filter((p) => p.index === col)
            .map((p) => (
              <motion.span
                layoutId={`ptr-${p.label}`}
                key={p.label}
                className={`flex flex-col items-center font-mono text-xs font-semibold ${toneText[p.tone ?? "active"]}`}
              >
                <span aria-hidden="true">↑</span>
                {p.label}
              </motion.span>
            ))}
        </div>
      ))}
    </div>
  );
}
