import { describe, expect, it } from "vitest";
import { bfsDistances, bfsSteps, dfsSteps, parseGraphInput } from "./graph-traversal";
import { dijkstraSteps, parseDijkstra, shortestReference } from "./dijkstra";
import { isMinHeap, topKSteps } from "./heap";
import { kruskalSteps, mstWeightReference, parseKruskal } from "./kruskal";
import { lcsBrute, lcsSteps } from "./lcs";
import { subsetsSteps } from "./subsets";
import { last, randInts, rng } from "./test-utils";
import { isTopological, parseTopo, topoSteps } from "./topo-sort";
import { parseBinaryTree, traverseReference, treeTraversalSteps, type TraversalMode } from "./tree-traversal";
import { parseTrie, trieSteps } from "./trie";
import { componentCount, parseUnionFind, unionFindSteps } from "./union-find";

const rand = rng(7);

const must = <T,>(r: { ok: true; value: T } | { ok: false }): T => {
  if (!r.ok) throw new Error("parse failed");
  return r.value;
};

describe("heap top-k", () => {
  it("returns the k largest and keeps the heap property", () => {
    for (let t = 0; t < 200; t++) {
      const nums = randInts(rand, 1 + Math.floor(rand() * 12), -20, 20);
      const k = 1 + Math.floor(rand() * Math.min(6, nums.length));
      const steps = topKSteps({ nums, k });
      const heap = last(steps).state.heap;
      expect([...heap].sort((a, b) => a - b)).toEqual([...nums].sort((a, b) => b - a).slice(0, k).sort((a, b) => a - b));
      expect(isMinHeap(heap)).toBe(true);
    }
  });
});

describe("tree traversal", () => {
  const modes: TraversalMode[] = ["bfs", "preorder", "inorder", "postorder"];
  it.each(["1,2,3,4,5,6,7", "1,null,2,null,3", "5,3,8,1,4,null,9", "1"])("tree %s", (raw) => {
    const tree = must(parseBinaryTree(raw));
    for (const m of modes) expect(last(treeTraversalSteps(tree, m)).state.out).toEqual(traverseReference(tree, m));
  });
  it("parses LeetCode format", () => {
    const t = must(parseBinaryTree("1,null,2,3"));
    expect(t.val).toEqual([1, 2, 3]);
    expect(t.right[0]).toBe(1);
    expect(t.left[1]).toBe(2);
  });
  it("call stack is empty at the end", () => {
    const tree = must(parseBinaryTree("1,2,3"));
    expect(last(treeTraversalSteps(tree, "inorder")).state.frames).toEqual([]);
  });
});

describe("graph traversal", () => {
  it("BFS distances match reference", () => {
    const input = must(parseGraphInput("A-B, A-C, B-D, C-D, D-E, F-G; A"));
    const ours = last(bfsSteps(input)).state.dist;
    expect(ours).toEqual(bfsDistances(input));
    expect(ours.F).toBeUndefined();
  });
  it("DFS visits the reachable component exactly once", () => {
    const input = must(parseGraphInput("A-B, A-C, B-D, C-D, D-E, F-G; A"));
    const order = last(dfsSteps(input)).state.order;
    expect(new Set(order).size).toBe(order.length);
    expect([...order].sort()).toEqual(["A", "B", "C", "D", "E"]);
    expect(order[0]).toBe("A");
  });
});

describe("topological sort", () => {
  it("produces a valid order for a DAG", () => {
    const input = must(parseTopo("A>B, A>C, B>D, C>D, D>E"));
    const s = last(topoSteps(input)).state;
    expect(s.cycle).toBeNull();
    expect(isTopological(s.order, input.edges)).toBe(true);
  });
  it("detects a cycle", () => {
    const s = last(topoSteps(must(parseTopo("A>B, B>C, C>A, C>D")))).state;
    expect(s.cycle).toEqual(["A", "B", "C", "D"]);
  });
});

describe("union-find", () => {
  it("flags exactly the cycle-closing edges", () => {
    const input = must(parseUnionFind("1-2, 3-4, 2-3, 1-4, 5-6"));
    const s = last(unionFindSteps(input)).state;
    expect(s.redundant).toEqual([["1", "4"]]);
    const roots = new Set(s.parent.map((_, i) => {
      let r = i;
      while (s.parent[r] !== r) r = s.parent[r];
      return r;
    }));
    expect(roots.size).toBe(componentCount(input.nodes, input.edges));
  });
});

describe("dijkstra", () => {
  it("matches Bellman-Ford on random graphs", () => {
    const names = "ABCDEF".split("");
    for (let t = 0; t < 100; t++) {
      const edges: string[] = [];
      for (let i = 0; i < names.length; i++) {
        for (let j = i + 1; j < names.length; j++) if (rand() < 0.45) edges.push(`${names[i]}-${names[j]}:${1 + Math.floor(rand() * 9)}`);
      }
      if (!edges.length || !edges.some((e) => e.startsWith("A"))) continue;
      const input = must(parseDijkstra(`${edges.join(", ")}; A`));
      expect(last(dijkstraSteps(input)).state.dist).toEqual(shortestReference(input));
    }
  });
});

describe("kruskal", () => {
  it("MST weight matches Prim", () => {
    const input = must(parseKruskal("A-B:4, A-C:1, B-C:2, B-D:5, C-D:8, D-E:3, C-E:9"));
    const s = last(kruskalSteps(input)).state;
    expect(s.accepted.length).toBe(input.nodes.length - 1);
    expect(s.total).toBe(mstWeightReference(input));
  });
});

describe("subsets", () => {
  it("generates all 2^n distinct subsets", () => {
    const out = last(subsetsSteps([1, 2, 3, 4])).state.out;
    expect(out).toHaveLength(16);
    expect(new Set(out.map((s) => s.join(","))).size).toBe(16);
  });
});

describe("LCS", () => {
  it("matches the exponential reference", () => {
    for (let t = 0; t < 100; t++) {
      const a = randInts(rand, 1 + Math.floor(rand() * 7), 0, 3).map((x) => "ABCD"[x]).join("");
      const b = randInts(rand, 1 + Math.floor(rand() * 7), 0, 3).map((x) => "ABCD"[x]).join("");
      const s = last(lcsSteps({ a, b })).state;
      const len = lcsBrute(a, b);
      expect(s.dp[a.length][b.length]).toBe(len);
      expect(s.answer?.length).toBe(len);
    }
  });
});

describe("trie", () => {
  it("prefix search", () => {
    const found = (raw: string) => last(trieSteps(must(parseTrie(raw)))).state.found;
    expect(found("car, cat, cart, dog; ca")).toBe(true);
    expect(found("car, cat, cart, dog; cb")).toBe(false);
    expect(found("car; cart")).toBe(false);
  });
  it("shares prefixes", () => {
    const s = last(trieSteps(must(parseTrie("car, cat, cart; c")))).state;
    expect(s.nodes).toHaveLength(1 + 5); // root + c, a, r, t(cat), t(cart)
  });
});
