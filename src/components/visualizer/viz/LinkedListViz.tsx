"use client";

import { motion } from "motion/react";
import { parseLinkedList, reverseListCode, reverseListSteps } from "@/visualizer/algorithms/linked-list";
import { useL } from "../useL";
import { Visualizer } from "../Visualizer";

export function LinkedListViz() {
  const l = useL();
  return (
    <Visualizer
      title={{ en: "Reverse a linked list in place", uz: "Linked list'ni joyida teskari qilish" }}
      code={reverseListCode}
      defaultInput="1, 2, 3, 4, 5"
      parse={parseLinkedList}
      generate={reverseListSteps}
      inputLabel={{ en: "Node values", uz: "Node qiymatlari" }}
      render={(s) => (
        <div className="flex flex-col gap-3">
          <ol className="flex flex-wrap items-center gap-1 font-mono text-sm" aria-label={l("nodes in memory order", "xotiradagi node'lar")}>
            {s.values.map((v, i) => {
              const target = s.next[i];
              const arrow = target === null ? "∅" : target > i ? "→" : "←";
              const labels = [s.prev === i && "prev", s.curr === i && "curr", s.nxt === i && "next", s.head === i && "head"].filter(Boolean);
              return (
                <li key={i} className="flex items-center gap-1">
                  <div className="flex flex-col items-center gap-1">
                    <motion.div layout className={`grid size-11 place-items-center rounded-md border ${s.curr === i ? "border-accent bg-accent/20" : s.prev === i ? "border-emerald-500 bg-emerald-500/15" : "border-border bg-bg"}`}>
                      {v}
                    </motion.div>
                    <span className="h-4 text-[0.65rem] font-semibold text-accent">{labels.join(" ")}</span>
                  </div>
                  <span className={`mb-5 w-6 text-center text-lg ${target !== null && target < i ? "text-emerald-600 dark:text-emerald-400" : "text-fg-subtle"}`} aria-label={`next = ${target === null ? "null" : s.values[target]}`}>
                    {arrow}
                  </span>
                </li>
              );
            })}
          </ol>
          <p className="text-xs text-fg-muted">
            {l("Arrows show each node's next pointer. Green arrows are already reversed.", "Strelkalar har bir node'ning next pointer'ini koʻrsatadi. Yashil strelkalar allaqachon teskari qilingan.")}
          </p>
        </div>
      )}
    />
  );
}
