"use client";

import { houseRobberCode, houseRobberSteps, parseHouseRobber } from "@/visualizer/algorithms/house-robber";
import type { Tone } from "@/visualizer/core/types";
import { ArrayView } from "../primitives";
import { useL } from "../useL";
import { Visualizer } from "../Visualizer";

export function HouseRobberViz() {
  const l = useL();
  return (
    <Visualizer
      title={{ en: "1D DP — house robber", uz: "1D DP — house robber" }}
      code={houseRobberCode}
      defaultInput="2, 7, 9, 3, 1, 5"
      parse={parseHouseRobber}
      generate={houseRobberSteps}
      inputLabel={{ en: "Amounts per house", uz: "Har bir uydagi miqdor" }}
      render={(s) => {
        const dpTones: Partial<Record<number, Tone>> = {};
        if (s.i !== null) {
          dpTones[s.i] = "active";
          if (s.i >= 1) dpTones[s.i - 1] = s.choice === "skip" ? "match" : "compare";
          if (s.i >= 2) dpTones[s.i - 2] = s.choice === "rob" ? "match" : "compare";
        }
        return (
          <div className="flex flex-col gap-4">
            <ArrayView label={l("houses", "uylar")} items={s.nums} tones={s.i !== null && s.i >= 1 ? { [s.i - 1]: s.choice === "rob" || s.i === 1 ? "found" : "muted" } : {}} />
            <ArrayView label="dp" items={s.dp} tones={dpTones} />
          </div>
        );
      }}
    />
  );
}
