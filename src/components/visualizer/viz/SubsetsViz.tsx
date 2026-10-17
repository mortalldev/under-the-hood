"use client";

import { parseSubsets, subsetsCode, subsetsSteps } from "@/visualizer/algorithms/subsets";
import { ArrayView, CallStackView, TimelineView } from "../primitives";
import { useL } from "../useL";
import { Visualizer } from "../Visualizer";

export function SubsetsViz() {
  const l = useL();
  return (
    <Visualizer
      title={{ en: "Backtracking — all subsets (choose / explore / un-choose)", uz: "Backtracking — barcha subset'lar (tanlash / chuqurlash / bekor qilish)" }}
      code={subsetsCode}
      defaultInput="1, 2, 3"
      parse={parseSubsets}
      generate={subsetsSteps}
      inputLabel={{ en: "Distinct numbers (up to 4)", uz: "Har xil sonlar (4 tagacha)" }}
      render={(s) => (
        <div className="flex flex-wrap items-start gap-6">
          <div className="flex flex-col gap-4">
            <ArrayView label="nums" items={s.nums} tones={s.i === null ? {} : { [s.i]: "active" }} />
            <ArrayView label="path" items={s.path.length ? s.path : [null]} showIndex={false} tones={Object.fromEntries(s.path.map((_, i) => [i, "window"]))} />
            <TimelineView label={l("results", "natijalar")} entries={s.out.map((x) => `[${x.join(",")}]`)} />
          </div>
          <CallStackView label="call stack" frames={s.frames.map((f) => ({ id: f.id, title: `backtrack(${f.start})` }))} />
        </div>
      )}
    />
  );
}
