"use client";

import { parseSlidingWindow, slidingWindowCode, slidingWindowSteps } from "@/visualizer/algorithms/sliding-window";
import type { Tone } from "@/visualizer/core/types";
import { ArrayView, MapView, Stats } from "../primitives";
import { useL } from "../useL";
import { Visualizer } from "../Visualizer";

export function SlidingWindowViz() {
  const l = useL();
  return (
    <Visualizer
      title={{ en: "Variable sliding window — longest substring without repeats", uz: "Variable sliding window — takrorlanmas eng uzun substring" }}
      code={slidingWindowCode}
      defaultInput="abcabcbb"
      parse={parseSlidingWindow}
      generate={slidingWindowSteps}
      inputLabel={{ en: "String (no spaces)", uz: "String (boʻsh joysiz)" }}
      presets={[
        { label: "abcabcbb", input: "abcabcbb" },
        { label: "pwwkew", input: "pwwkew" },
        { label: "abba", input: "abba" },
        { label: "dvdf", input: "dvdf" },
      ]}
      render={(s) => {
        const tones: Partial<Record<number, Tone>> = {};
        if (s.done) {
          for (let i = s.bestFrom; i < s.bestFrom + s.best; i++) tones[i] = "found";
        } else if (s.right !== null) {
          for (let i = s.left; i <= s.right; i++) tones[i] = "window";
          tones[s.right] = "active";
          if (s.dup !== null) tones[s.dup] = "danger";
        }
        return (
          <div className="flex flex-col gap-4">
            <ArrayView
              items={s.chars}
              tones={tones}
              pointers={s.done || s.right === null ? [] : [{ index: s.left, label: "L" }, { index: s.right, label: "R", tone: "compare" }]}
            />
            <MapView label={l("last seen index", "oxirgi koʻrilgan indeks")} entries={s.last.map(([k, v]) => ({ key: `'${k}'`, value: String(v), tone: s.right !== null && s.chars[s.right] === k ? "active" : undefined }))} />
            <Stats items={[["best", s.best], [l("window", "window"), s.right === null ? "—" : `[${s.left}, ${s.right}]`]]} />
          </div>
        );
      }}
    />
  );
}
