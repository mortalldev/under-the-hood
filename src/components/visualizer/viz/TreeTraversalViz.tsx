"use client";

import { useCallback } from "react";
import { parseBinaryTree, traversalCode, treeTraversalSteps, type BinaryTree, type TraversalMode } from "@/visualizer/algorithms/tree-traversal";
import type { Tone } from "@/visualizer/core/types";
import { CallStackView, QueueView, TimelineView, TreeView } from "../primitives";
import { useL } from "../useL";
import { Visualizer } from "../Visualizer";

const titles: Record<TraversalMode, { en: string; uz: string }> = {
  bfs: { en: "Tree BFS (level order) with a queue", uz: "Tree BFS (level order) queue bilan" },
  preorder: { en: "Recursive DFS — preorder", uz: "Recursive DFS — preorder" },
  inorder: { en: "Recursive DFS — inorder", uz: "Recursive DFS — inorder" },
  postorder: { en: "Recursive DFS — postorder", uz: "Recursive DFS — postorder" },
};

export function TreeTraversalViz({ mode = "inorder" }: { mode?: TraversalMode }) {
  const l = useL();
  const generate = useCallback((t: BinaryTree) => treeTraversalSteps(t, mode), [mode]);
  return (
    <Visualizer
      title={titles[mode]}
      code={traversalCode(mode)}
      defaultInput="5, 3, 8, 1, 4, 7, 9, null, 2"
      parse={parseBinaryTree}
      generate={generate}
      inputLabel={{ en: "Level order (LeetCode format, null for gaps)", uz: "Level order (LeetCode formati, boʻshliq uchun null)" }}
      presets={[
        { label: "BST", input: "5, 3, 8, 1, 4, 7, 9, null, 2" },
        { label: l("complete", "toʻliq"), input: "1, 2, 3, 4, 5, 6, 7" },
        { label: l("skewed", "qiyshiq"), input: "1, null, 2, null, 3, null, 4" },
      ]}
      render={(s) => {
        const t = s.tree;
        const ids = t.val.map((_, i) => i);
        const tone = (i: number): Tone | undefined => {
          if (i === s.current) return "active";
          if (s.visited.includes(i)) return "visited";
          if (s.queue.includes(i) || s.frames.some((f) => f.node === i)) return "compare";
          return undefined;
        };
        return (
          <div className="flex flex-col gap-4">
            <TreeView
              root={t.root === null ? null : String(t.root)}
              nodes={ids.map((i) => ({
                id: String(i),
                label: String(t.val[i]),
                tone: tone(i),
                children: t.left[i] === null && t.right[i] === null ? [] : [t.left[i] === null ? null : String(t.left[i]), t.right[i] === null ? null : String(t.right[i])],
              }))}
            />
            <div className="flex flex-wrap items-start gap-6">
              {mode === "bfs" ? (
                <QueueView label="queue" items={s.queue.map((i) => ({ id: i, label: String(t.val[i]) }))} />
              ) : (
                <CallStackView label="call stack" frames={s.frames.map((f) => ({ id: f.id, title: `walk(${f.node === null ? "null" : t.val[f.node]})` }))} />
              )}
              <TimelineView label="output" entries={s.out.map(String)} />
            </div>
          </div>
        );
      }}
    />
  );
}
