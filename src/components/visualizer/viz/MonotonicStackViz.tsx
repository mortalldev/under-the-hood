"use client";

import { monotonicStackCode, monotonicStackSteps, parseMonotonicStack } from "@/visualizer/algorithms/monotonic-stack";
import type { Tone } from "@/visualizer/core/types";
import { ArrayView, StackView } from "../primitives";
import { useL } from "../useL";
import { Visualizer } from "../Visualizer";

export function MonotonicStackViz() {
  const l = useL();
  return (
    <Visualizer
      title={{ en: "Monotonic stack — next greater element", uz: "Monotonic stack — keyingi kattaroq element" }}
      code={monotonicStackCode}
      defaultInput="2, 1, 2, 4, 3, 1, 5"
      parse={parseMonotonicStack}
      generate={monotonicStackSteps}
      inputLabel={{ en: "Array", uz: "Array" }}
      presets={[
        { label: l("mixed", "aralash"), input: "2, 1, 2, 4, 3, 1, 5" },
        { label: l("decreasing", "kamayuvchi"), input: "9, 7, 5, 3, 1" },
        { label: l("increasing", "oʻsuvchi"), input: "1, 2, 3, 4" },
      ]}
      render={(s) => {
        const tones: Partial<Record<number, Tone>> = {};
        for (const j of s.stack) tones[j] = "window";
        if (s.popped !== null) tones[s.popped] = "found";
        if (s.i !== null) tones[s.i] = "active";
        return (
          <div className="flex flex-wrap items-start gap-6">
            <div className="flex flex-col gap-4">
              <ArrayView label="nums" items={s.nums} tones={tones} pointers={s.i === null ? [] : [{ index: s.i, label: "i" }]} />
              <ArrayView label="res" items={s.res} tones={s.popped !== null ? { [s.popped]: "found" } : {}} />
            </div>
            <StackView label={l("stack (indices)", "stack (indekslar)")} items={s.stack.map((j) => ({ id: j, label: `${j} → ${s.nums[j]}` }))} />
          </div>
        );
      }}
    />
  );
}
