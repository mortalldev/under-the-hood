"use client";

import { parseTopK, topKCode, topKSteps } from "@/visualizer/algorithms/heap";
import type { Tone } from "@/visualizer/core/types";
import { ArrayView, HeapView, TimelineView } from "../primitives";
import { useL } from "../useL";
import { Visualizer } from "../Visualizer";

export function TopKViz() {
  const l = useL();
  return (
    <Visualizer
      title={{ en: "Top-K with a min-heap", uz: "Min-heap bilan Top-K" }}
      code={topKCode}
      defaultInput="5, 1, 9, 3, 7, 2, 8, 6; 3"
      parse={parseTopK}
      generate={topKSteps}
      inputLabel={{ en: "Array; k", uz: "Array; k" }}
      render={(s) => {
        const tones: Partial<Record<number, Tone>> = {};
        for (const i of s.focus) tones[i] = "compare";
        for (const i of s.swapped) tones[i] = "active";
        return (
          <div className="flex flex-col gap-4">
            <ArrayView label="nums" items={s.nums} tones={s.i === null ? {} : { [s.i]: "active" }} pointers={s.i === null ? [] : [{ index: s.i, label: "x" }]} />
            <HeapView label={l("min-heap", "min-heap")} heap={s.heap} tones={tones} />
            <TimelineView label={l("evicted", "chiqarilgan")} entries={s.evicted.map(String)} highlightLast={false} />
          </div>
        );
      }}
    />
  );
}
