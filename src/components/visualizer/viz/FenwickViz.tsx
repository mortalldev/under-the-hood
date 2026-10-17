"use client";

import { fenwickCode, fenwickSteps, parseFenwick } from "@/visualizer/algorithms/fenwick";
import type { Tone } from "@/visualizer/core/types";
import { ArrayView, Stats } from "../primitives";
import { useL } from "../useL";
import { Visualizer } from "../Visualizer";

export function FenwickViz() {
  const l = useL();
  return (
    <Visualizer
      title={{ en: "Fenwick tree (BIT) — build, then prefix query", uz: "Fenwick tree (BIT) — qurish, keyin prefix soʻrov" }}
      code={fenwickCode}
      defaultInput="3, 2, -1, 6, 5, 4, -3, 3; 7"
      parse={parseFenwick}
      generate={fenwickSteps}
      inputLabel={{ en: "Array; i (1-based prefix length)", uz: "Array; i (1 dan boshlanuvchi prefix uzunligi)" }}
      render={(s) => {
        const tones: Partial<Record<number, Tone>> = { 0: "muted" };
        for (const i of s.visited) tones[i] = s.phase === "build" ? "compare" : "found";
        if (s.i !== null) tones[s.i] = "active";
        return (
          <div className="flex flex-col gap-4">
            <ArrayView label={l("nums (1-based)", "nums (1 dan)")} items={[null, ...s.nums]} />
            <ArrayView label="tree" items={s.tree} tones={tones} />
            <ArrayView label="lowbit(i)" items={s.tree.map((_, i) => (i === 0 ? null : i & -i))} showIndex={false} />
            {s.phase !== "build" && <Stats items={[["s", s.sum]]} />}
          </div>
        );
      }}
    />
  );
}
