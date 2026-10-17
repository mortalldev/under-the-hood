"use client";

import { lruCode, lruSteps, parseLru } from "@/visualizer/algorithms/lru";
import type { Tone } from "@/visualizer/core/types";
import { MapView, Stats } from "../primitives";
import { useL } from "../useL";
import { Visualizer } from "../Visualizer";

export function LruViz() {
  const l = useL();
  return (
    <Visualizer
      title={{ en: "LRU cache eviction", uz: "LRU cache'dan chiqarish" }}
      code={lruCode}
      defaultInput="3; put a 1, put b 2, put c 3, get a, put d 4, get b, get c, put e 5, get a"
      parse={parseLru}
      generate={lruSteps}
      inputLabel={{ en: "capacity; operations", uz: "sigʻim; amallar" }}
      render={(s) => (
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 text-xs text-fg-muted">
            <span>{l("least recent", "eng eski")}</span>
            <span aria-hidden="true">→</span>
            <span>{l("most recent", "eng yangi")}</span>
          </div>
          <MapView
            entries={s.entries.map(([k, v]) => {
              let tone: Tone | undefined;
              if (k === s.touched) tone = s.hit === false ? "danger" : "active";
              return { key: k, value: v, tone };
            })}
          />
          <Stats items={[["op", s.op ?? "—"], ...(s.evicted ? [[l("evicted", "chiqarildi"), s.evicted] as [string, string]] : []), ["hits", s.hits], ["misses", s.misses]]} />
        </div>
      )}
    />
  );
}
