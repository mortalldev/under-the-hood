"use client";

import { binarySearchCode, binarySearchSteps, parseBinarySearch } from "@/visualizer/algorithms/binary-search";
import type { Tone } from "@/visualizer/core/types";
import { ArrayView, Stats } from "../primitives";
import { useL } from "../useL";
import { Visualizer } from "../Visualizer";

export function BinarySearchViz() {
  const l = useL();
  return (
    <Visualizer
      title={{ en: "Binary search — lower bound", uz: "Binary search — lower bound" }}
      code={binarySearchCode}
      defaultInput="1, 3, 3, 5, 8, 13, 21; 5"
      parse={parseBinarySearch}
      generate={binarySearchSteps}
      inputLabel={{ en: "Sorted array; target", uz: "Saralangan array; target" }}
      inputHint={{ en: "Try a target smaller than everything, larger than everything, and a duplicate.", uz: "Hammasidan kichik, hammasidan katta va takrorlanuvchi target'larni sinab koʻring." }}
      presets={[
        { label: "5", input: "1, 3, 3, 5, 8, 13, 21; 5" },
        { label: l("duplicates", "dublikatlar"), input: "1, 3, 3, 3, 8; 3" },
        { label: l("past end", "oxiridan keyin"), input: "1, 2, 4; 9" },
        { label: l("before start", "boshidan oldin"), input: "4, 6, 9; -2" },
      ]}
      render={(s) => {
        const tones: Partial<Record<number, Tone>> = {};
        s.nums.forEach((_, i) => {
          if (i < s.lo || i >= s.hi) tones[i] = "muted";
        });
        if (s.mid !== null) tones[s.mid] = "compare";
        if (s.result !== null && s.result < s.nums.length) tones[s.result] = "found";
        const pointers = [
          { index: s.lo, label: "lo" },
          ...(s.result === null ? [{ index: s.hi, label: "hi", tone: "visited" as const }] : []),
          ...(s.mid !== null ? [{ index: s.mid, label: "mid", tone: "compare" as const }] : []),
        ];
        return (
          <div className="flex flex-col gap-4">
            <ArrayView items={s.nums} tones={tones} pointers={pointers} />
            <Stats items={[["target", s.target], [l("candidates", "nomzodlar"), s.hi - s.lo], ...(s.result !== null ? [["answer", s.result] as [string, number]] : [])]} />
          </div>
        );
      }}
    />
  );
}
