"use client";

import { dynamicArrayCode, dynamicArraySteps, parseDynamicArray } from "@/visualizer/algorithms/dynamic-array";
import type { Tone } from "@/visualizer/core/types";
import { ArrayView, Stats } from "../primitives";
import { useL } from "../useL";
import { Visualizer } from "../Visualizer";

export function DynamicArrayViz() {
  const l = useL();
  return (
    <Visualizer
      title={{ en: "Amortized O(1): pushing into a doubling array", uz: "Amortized O(1): ikki baravar oʻsuvchi array'ga push" }}
      code={dynamicArrayCode}
      defaultInput="9"
      parse={parseDynamicArray}
      generate={dynamicArraySteps}
      inputLabel={{ en: "Number of pushes (1–17)", uz: "Push'lar soni (1–17)" }}
      render={(s) => {
        const tones: Partial<Record<number, Tone>> = {};
        for (let i = 0; i < s.size; i++) tones[i] = s.resized && i < s.size - 1 ? "compare" : "window";
        if (s.size > 0) tones[s.size - 1] = "active";
        return (
          <div className="flex flex-col gap-4">
            <ArrayView label={`${l("capacity", "sigʻim")} ${s.slots.length}`} items={s.slots} tones={tones} />
            <Stats items={[[l("last push cost", "oxirgi push narxi"), s.lastCost], [l("total cost", "jami narx"), s.totalCost], [l("average", "oʻrtacha"), s.pushes ? (s.totalCost / s.pushes).toFixed(2) : "—"]]} />
          </div>
        );
      }}
    />
  );
}
