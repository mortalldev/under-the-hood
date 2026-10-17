"use client";

import { parseTrie, trieCode, trieSteps } from "@/visualizer/algorithms/trie";
import type { Tone } from "@/visualizer/core/types";
import { Stats, TreeView } from "../primitives";
import { useL } from "../useL";
import { Visualizer } from "../Visualizer";

export function TrieViz() {
  const l = useL();
  return (
    <Visualizer
      title={{ en: "Trie — insert words, then search a prefix", uz: "Trie — soʻzlarni qoʻshish, keyin prefix qidirish" }}
      code={trieCode}
      defaultInput="car, cat, cart, dog; ca"
      parse={parseTrie}
      generate={trieSteps}
      inputLabel={{ en: "words; prefix", uz: "soʻzlar; prefix" }}
      presets={[
        { label: "ca", input: "car, cat, cart, dog; ca" },
        { label: "do", input: "car, cat, cart, dog; do" },
        { label: "cb", input: "car, cat, cart, dog; cb" },
      ]}
      render={(s) => (
        <div className="flex flex-col gap-3">
          <TreeView
            root="root"
            nodes={s.nodes.map((n) => {
              let tone: Tone | undefined;
              if (s.path.includes(n.id)) tone = s.phase === "done" && s.found === false ? "danger" : "visited";
              if (n.id === s.current) tone = s.phase === "done" && s.found ? "found" : "active";
              if (n.id === s.created) tone = "match";
              return { id: n.id, label: n.end ? `${n.ch}✓` : n.ch, children: n.children, tone };
            })}
          />
          <Stats items={[[s.phase === "insert" ? "insert" : "search", `"${s.word}"`], [l("nodes", "node'lar"), s.nodes.length], ["✓", l("end of word", "soʻz oxiri")]]} />
        </div>
      )}
    />
  );
}
