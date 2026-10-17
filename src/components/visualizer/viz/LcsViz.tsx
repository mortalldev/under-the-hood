"use client";

import { lcsCode, lcsSteps, parseLcs } from "@/visualizer/algorithms/lcs";
import type { Tone } from "@/visualizer/core/types";
import { GridView, Stats } from "../primitives";
import { Visualizer } from "../Visualizer";

export function LcsViz() {
  return (
    <Visualizer
      title={{ en: "2D DP — longest common subsequence table", uz: "2D DP — longest common subsequence jadvali" }}
      code={lcsCode}
      defaultInput="ABCBDAB; BDCABA"
      parse={parseLcs}
      generate={lcsSteps}
      inputLabel={{ en: "a; b (up to 8 chars each)", uz: "a; b (har biri 8 belgigacha)" }}
      presets={[
        { label: "ABCBDAB / BDCABA", input: "ABCBDAB; BDCABA" },
        { label: "kitten / sitting", input: "kitten; sitting" },
        { label: "abc / def", input: "abc; def" },
      ]}
      render={(s) => {
        const tones: Partial<Record<string, Tone>> = {};
        for (const [i, j] of s.path) tones[`${i},${j}`] = "found";
        for (const [i, j] of s.deps) tones[`${i},${j}`] = "compare";
        if (s.cur) tones[`${s.cur[0]},${s.cur[1]}`] = s.match ? "match" : "active";
        return (
          <div className="flex flex-col gap-3">
            <GridView cells={s.dp} rowHeaders={["∅", ...s.a]} colHeaders={["∅", ...s.b]} tones={tones} corner="a/b" />
            {s.answer !== null && <Stats items={[["LCS", `"${s.answer}"`], ["length", s.answer.length]]} />}
          </div>
        );
      }}
    />
  );
}
