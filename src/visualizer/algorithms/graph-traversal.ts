import { parseEdges, splitParts, type EdgeSpec } from "../core/parse";
import { recorder } from "../core/recorder";
import { fail, ok, type ParseResult } from "../core/types";

export const bfsCode = `function bfs(adj: Map<string, string[]>, start: string) {
  const dist = new Map([[start, 0]]);
  const queue = [start];
  for (let head = 0; head < queue.length; head++) {
    const u = queue[head];               // dequeue (head index: O(1))
    for (const v of adj.get(u) ?? []) {
      if (dist.has(v)) continue;         // already discovered
      dist.set(v, dist.get(u)! + 1);     // mark when ENQUEUED
      queue.push(v);
    }
  }
  return dist;                           // shortest hop counts
}`;

export const dfsCode = `function dfs(adj: Map<string, string[]>, u: string,
             seen = new Set<string>(), order: string[] = []) {
  seen.add(u);                           // mark on entry
  order.push(u);
  for (const v of adj.get(u) ?? []) {
    if (!seen.has(v)) dfs(adj, v, seen, order);
  }
  return order;                          // returns after all descendants
}`;

export interface GraphInput {
  nodes: string[];
  edges: EdgeSpec[];
  start: string;
}

export interface TraversalState {
  nodes: string[];
  edges: EdgeSpec[];
  current: string | null;
  discovered: string[];
  finished: string[];
  frontier: string[];
  order: string[];
  dist: Record<string, number>;
  activeEdge: [string, string] | null;
  treeEdges: [string, string][];
}

export function parseGraphInput(raw: string): ParseResult<GraphInput> {
  const parts = splitParts(raw, 2);
  if (!parts.ok) return parts;
  const g = parseEdges(parts.value[0], { directed: false, weighted: false });
  if (!g.ok) return g;
  const start = parts.value[1];
  if (!g.value.nodes.includes(start)) return fail(`Start node "${start}" is not in the graph.`, `"${start}" boshlangʻich node graph'da yoʻq.`);
  return ok({ ...g.value, start });
}

export function adjacency(nodes: string[], edges: EdgeSpec[], directed = false) {
  const adj = new Map<string, string[]>(nodes.map((n) => [n, []]));
  for (const e of edges) {
    adj.get(e.from)?.push(e.to);
    if (!directed) adj.get(e.to)?.push(e.from);
  }
  return adj;
}

const base = (input: GraphInput): TraversalState => ({
  nodes: input.nodes,
  edges: input.edges,
  current: null,
  discovered: [],
  finished: [],
  frontier: [],
  order: [],
  dist: {},
  activeEdge: null,
  treeEdges: [],
});

export function bfsSteps(input: GraphInput) {
  const rec = recorder<TraversalState>();
  const adj = adjacency(input.nodes, input.edges);
  const st = base(input);
  st.discovered = [input.start];
  st.frontier = [input.start];
  st.dist = { [input.start]: 0 };
  rec.push(st, 3, `Discover ${input.start} (distance 0) and enqueue it. The queue holds the frontier: discovered but not yet expanded.`, `${input.start} topildi (masofa 0) va queue'ga qoʻshildi. Queue — frontier: topilgan, lekin hali kengaytirilmagan node'lar.`);

  while (st.frontier.length) {
    const u = st.frontier.shift() as string;
    st.current = u;
    st.activeEdge = null;
    st.order.push(u);
    rec.push(st, 5, `Dequeue ${u} (distance ${st.dist[u]}). FIFO order means every node at distance d is expanded before any at d + 1.`, `${u} queue'dan olinadi (masofa ${st.dist[u]}). FIFO tartibi d masofadagi barcha node'lar d + 1 dagilardan oldin kengaytirilishini kafolatlaydi.`);
    for (const v of adj.get(u) ?? []) {
      st.activeEdge = [u, v];
      if (v in st.dist) {
        rec.push(st, 7, `Edge ${u}–${v}: ${v} is already discovered — skip. Checking here (not at dequeue) keeps each node in the queue at most once.`, `${u}–${v} edge: ${v} allaqachon topilgan — oʻtkazamiz. Buni shu yerda (dequeue'da emas) tekshirish har bir node queue'ga koʻpi bilan bir marta tushishini ta'minlaydi.`);
        continue;
      }
      st.dist[v] = st.dist[u] + 1;
      st.discovered.push(v);
      st.frontier.push(v);
      st.treeEdges.push([u, v]);
      rec.push(st, 8, `Discover ${v} via ${u}: distance ${st.dist[v]}. Enqueue.`, `${v} ${u} orqali topildi: masofa ${st.dist[v]}. Queue'ga qoʻshiladi.`);
    }
    st.finished.push(u);
    st.activeEdge = null;
  }
  st.current = null;
  const unreached = input.nodes.filter((n) => !(n in st.dist));
  rec.push(
    st,
    12,
    `Queue empty. Order: ${st.order.join(" → ")}. Each node and edge handled once: O(V + E).${unreached.length ? ` Unreachable: ${unreached.join(", ")}.` : ""}`,
    `Queue boʻsh. Tartib: ${st.order.join(" → ")}. Har bir node va edge bir marta koʻrildi: O(V + E).${unreached.length ? ` Yetib boʻlmaydigan: ${unreached.join(", ")}.` : ""}`,
  );
  return rec.steps;
}

export function dfsSteps(input: GraphInput) {
  const rec = recorder<TraversalState>();
  const adj = adjacency(input.nodes, input.edges);
  const st = base(input);
  const seen = new Set<string>();

  const visit = (u: string, parent: string | null) => {
    seen.add(u);
    st.discovered.push(u);
    st.order.push(u);
    st.frontier.push(u); // call stack
    st.current = u;
    st.activeEdge = null;
    if (parent) st.treeEdges.push([parent, u]);
    rec.push(st, 3, `Enter dfs(${u}): mark it seen. Call stack depth ${st.frontier.length}.`, `dfs(${u}) ga kirildi: seen deb belgilanadi. Call stack chuqurligi ${st.frontier.length}.`);
    for (const v of adj.get(u) ?? []) {
      st.current = u;
      st.activeEdge = [u, v];
      if (seen.has(v)) {
        rec.push(st, 6, `Edge ${u}–${v}: ${v} already seen — skip.`, `${u}–${v} edge: ${v} allaqachon koʻrilgan — oʻtkazamiz.`);
        continue;
      }
      rec.push(st, 6, `Edge ${u}–${v}: ${v} unseen — go deeper before looking at ${u}'s other neighbours.`, `${u}–${v} edge: ${v} koʻrilmagan — ${u} ning boshqa qoʻshnilaridan oldin chuqurroq kiramiz.`);
      visit(v, u);
    }
    st.frontier.pop();
    st.finished.push(u);
    st.current = st.frontier[st.frontier.length - 1] ?? null;
    st.activeEdge = null;
    rec.push(st, 8, `dfs(${u}) finishes — all its descendants are done. (Finish order is what topological sort uses.)`, `dfs(${u}) tugadi — uning barcha avlodlari qayta ishlangan. (Topological sort aynan shu tugash tartibidan foydalanadi.)`);
  };

  visit(input.start, null);
  st.current = null;
  rec.push(st, 8, `Visit order: ${st.order.join(" → ")}. O(V + E) time; recursion depth can reach V — use an explicit stack for very deep graphs.`, `Tashrif tartibi: ${st.order.join(" → ")}. O(V + E) vaqt; recursion chuqurligi V gacha yetishi mumkin — juda chuqur graph'lar uchun explicit stack ishlating.`);
  return rec.steps;
}

/** Plain BFS distances for tests. */
export function bfsDistances(input: GraphInput): Record<string, number> {
  const adj = adjacency(input.nodes, input.edges);
  const dist: Record<string, number> = { [input.start]: 0 };
  const q = [input.start];
  for (let h = 0; h < q.length; h++) {
    for (const v of adj.get(q[h]) ?? []) {
      if (!(v in dist)) {
        dist[v] = dist[q[h]] + 1;
        q.push(v);
      }
    }
  }
  return dist;
}
