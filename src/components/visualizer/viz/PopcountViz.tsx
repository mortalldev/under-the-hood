"use client";

import { parsePopcount, popcountCode, popcountSteps } from "@/visualizer/algorithms/popcount";
import type { Tone } from "@/visualizer/core/types";
import { ArrayView, Stats } from "../primitives";
import { Visualizer } from "../Visualizer";

const bits = (x: number, n: number) => x.toString(2).padStart(n, "0").split("").map(Number);

export function PopcountViz() {
  return (
    <Visualizer
      title={{ en: "Bit trick — x & (x − 1) clears the lowest set bit", uz: "Bit hiylasi — x & (x − 1) eng kichik 1-bitni tozalaydi" }}
      code={popcountCode}
      defaultInput="180"
      parse={parsePopcount}
      generate={popcountSteps}
      inputLabel={{ en: "x (0–255)", uz: "x (0–255)" }}
      presets={[{ label: "180", input: "180" }, { label: "64", input: "64" }, { label: "255", input: "255" }]}
      render={(s) => {
        const xb = bits(s.x, s.bits);
        const tones: Partial<Record<number, Tone>> = {};
        let mb: number[] | null = null;
        if (s.minusOne !== null) {
          mb = bits(s.minusOne, s.bits);
          xb.forEach((b, i) => {
            if (mb && b !== mb[i]) tones[i] = "compare";
          });
        }
        return (
          <div className="flex flex-col gap-3">
            <ArrayView label={`x = ${s.x}`} items={xb} tones={Object.fromEntries(xb.map((b, i) => [i, tones[i] ?? (b ? "window" : "default")]))} showIndex={false} />
            {mb && <ArrayView label={`x − 1 = ${s.minusOne}`} items={mb} tones={tones} showIndex={false} />}
            <Stats items={[["count", s.count]]} />
          </div>
        );
      }}
    />
  );
}
