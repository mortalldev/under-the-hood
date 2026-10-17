"use client";

import { hiddenClassCode, hiddenClassSteps, parseHiddenClasses } from "@/visualizer/algorithms/hidden-classes";
import type { Tone } from "@/visualizer/core/types";
import { MapView, TreeView } from "../primitives";
import { useL } from "../useL";
import { Visualizer } from "../Visualizer";

export function HiddenClassViz() {
  const l = useL();
  return (
    <Visualizer
      title={{ en: "Hidden classes (shapes) and transition trees", uz: "Hidden class'lar (shape'lar) va transition daraxti" }}
      code={hiddenClassCode}
      defaultInput="p1: x, y; p2: x, y; p3: y, x; p4: x, y, z"
      parse={parseHiddenClasses}
      generate={hiddenClassSteps}
      inputLabel={{ en: "objects: name: key order; …", uz: "obyektlar: nom: key tartibi; …" }}
      presets={[
        { label: l("consistent", "izchil"), input: "p1: x, y; p2: x, y; p3: x, y" },
        { label: l("mixed order", "aralash tartib"), input: "p1: x, y; p2: x, y; p3: y, x; p4: x, y, z" },
        { label: "megamorphic", input: "a: x; b: y, x; c: z, x; d: w, x; e: v, x; f: u, x" },
      ]}
      render={(s) => (
        <div className="flex flex-col gap-4">
          <TreeView
            root="S0"
            nodes={s.shapes.map((sh) => {
              let tone: Tone | undefined;
              if (s.icShapes?.includes(sh.id)) tone = s.icShapes.length === 1 ? "found" : s.icShapes.length <= 4 ? "compare" : "danger";
              if (sh.id === s.activeShape) tone = "active";
              if (sh.id === s.created) tone = "match";
              return { id: sh.id, label: sh.id, badge: sh.keys.length ? `{${sh.keys.join(",")}}` : "{}", children: sh.children, tone };
            })}
          />
          <MapView label={l("object → shape", "obyekt → shape")} entries={s.objects.map((o) => ({ key: o.name, value: o.shape }))} />
        </div>
      )}
    />
  );
}
