"use client";

import { parsePrefixSum, prefixSumCode, prefixSumSteps } from "@/visualizer/algorithms/prefix-sum";
import type { Tone } from "@/visualizer/core/types";
import { ArrayView, MapView, Stats } from "../primitives";
import { useL } from "../useL";
import { Visualizer } from "../Visualizer";

export function PrefixSumViz() {
  const l = useL();
  return (
    <Visualizer
      title={{ en: "Prefix sum + hash map — count subarrays summing to k", uz: "Prefix sum + hash map — yigʻindisi k ga teng subarray'larni sanash" }}
      code={prefixSumCode}
      defaultInput="1, 2, 3, -2, 2, 1; 3"
      parse={parsePrefixSum}
      generate={prefixSumSteps}
      inputLabel={{ en: "Array; k", uz: "Array; k" }}
      presets={[
        { label: "k=3", input: "1, 2, 3, -2, 2, 1; 3" },
        { label: "k=0", input: "1, -1, 1, -1; 0" },
        { label: "k=2", input: "1, 1, 1; 2" },
      ]}
      render={(s) => {
        const tones: Partial<Record<number, Tone>> = {};
        if (s.i !== null) {
          for (let j = 0; j < s.i; j++) tones[j] = "visited";
          tones[s.i] = "active";
        }
        return (
          <div className="flex flex-col gap-4">
            <ArrayView items={s.nums} tones={tones} pointers={s.i === null ? [] : [{ index: s.i, label: "i" }]} />
            <MapView
              label={l("seen: prefix → count", "seen: prefix → soni")}
              entries={s.seen.map(([k, v]) => ({ key: String(k), value: String(v), tone: s.lookFor === k ? (s.hit ? "found" : "compare") : undefined }))}
            />
            <Stats items={[["prefix", s.prefix], [l("looking for", "qidirilmoqda"), s.lookFor ?? "—"], ["count", s.count]]} />
          </div>
        );
      }}
    />
  );
}
