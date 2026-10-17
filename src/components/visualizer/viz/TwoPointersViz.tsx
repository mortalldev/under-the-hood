"use client";

import { parseTwoPointers, twoPointersCode, twoPointersSteps } from "@/visualizer/algorithms/two-pointers";
import type { Tone } from "@/visualizer/core/types";
import { ArrayView, Stats } from "../primitives";
import { useL } from "../useL";
import { Visualizer } from "../Visualizer";

export function TwoPointersViz() {
  const l = useL();
  return (
    <Visualizer
      title={{ en: "Two pointers — pair with a target sum (sorted input)", uz: "Two pointers — yigʻindisi target'ga teng juftlik (saralangan input)" }}
      code={twoPointersCode}
      defaultInput="1, 2, 4, 7, 11, 15; 15"
      parse={parseTwoPointers}
      generate={twoPointersSteps}
      inputLabel={{ en: "Sorted array; target", uz: "Saralangan array; target" }}
      presets={[
        { label: "15", input: "1, 2, 4, 7, 11, 15; 15" },
        { label: l("no pair", "juftlik yoʻq"), input: "1, 3, 5, 7; 20" },
        { label: l("negatives", "manfiylar"), input: "-8, -3, 0, 2, 9; -1" },
      ]}
      render={(s) => {
        const tones: Partial<Record<number, Tone>> = {};
        s.nums.forEach((_, i) => {
          if (i < s.l || i > s.r) tones[i] = "muted";
        });
        tones[s.l] = s.found ? "found" : "active";
        tones[s.r] = s.found ? "found" : "compare";
        return (
          <div className="flex flex-col gap-4">
            <ArrayView items={s.nums} tones={tones} pointers={s.done && !s.found ? [] : [{ index: s.l, label: "l" }, { index: s.r, label: "r", tone: "compare" }]} />
            <Stats items={[["sum", s.sum ?? "—"], [l("eliminated", "chiqarilgan"), s.nums.length - (s.r - s.l + 1)]]} />
          </div>
        );
      }}
    />
  );
}
