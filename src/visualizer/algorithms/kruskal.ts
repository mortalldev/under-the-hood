import { parseEdges, type EdgeSpec } from "../core/parse";
import { recorder } from "../core/recorder";
import type { ParseResult } from "../core/types";

export const kruskalCode = `function kruskal(n: number, edges: [number, number, number][]) {
  edges.sort((a, b) => a[2] - b[2]);       // cheapest first
  const uf = new UnionFind(n);
  const mst: [number, number, number][] = [];
  for (const [u, v, w] of edges) {
    if (uf.union(u, v)) mst.push([u, v, w]); // joins two components ⇒ safe
    if (mst.length === n - 1) break;
  }
  return mst;
}`;

export interface KruskalInput {
  nodes: string[];
  edges: EdgeSpec[];
}

export interface KruskalState {
  nodes: string[];
  edges: EdgeSpec[];
  order: number[];
  i: number | null;
  accepted: number[];
  rejected: number[];
  component: Record<string, string>;
  total: number;
}

export const parseKruskal = (raw: string): ParseResult<KruskalInput> =>
  parseEdges(raw, { directed: false, weighted: true });

export function kruskalSteps({ nodes, edges }: KruskalInput) {
  const rec = recorder<KruskalState>();
  const parent = new Map(nodes.map((n) => [n, n]));
  const find = (x: string): string => {
    const p = parent.get(x) as string;
    if (p === x) return x;
    const r = find(p);
    parent.set(x, r);
    return r;
  };
  const order = edges.map((_, i) => i).sort((a, b) => (edges[a].weight ?? 0) - (edges[b].weight ?? 0));
  const st: KruskalState = {
    nodes,
    edges,
    order,
    i: null,
    accepted: [],
    rejected: [],
    component: Object.fromEntries(nodes.map((n) => [n, n])),
    total: 0,
  };
  rec.push(st, 2, `Sort edges by weight: ${order.map((k) => `${edges[k].from}${edges[k].to}:${edges[k].weight}`).join(", ")}.`, `Edge'larni vazn boʻyicha saralaymiz: ${order.map((k) => `${edges[k].from}${edges[k].to}:${edges[k].weight}`).join(", ")}.`);

  for (const k of order) {
    const e = edges[k];
    st.i = k;
    const ra = find(e.from);
    const rb = find(e.to);
    if (ra === rb) {
      st.rejected.push(k);
      rec.push(st, 6, `${e.from}–${e.to} (${e.weight}): both already in the same component — it would close a cycle. Reject.`, `${e.from}–${e.to} (${e.weight}): ikkalasi bir component'da — cycle yopiladi. Rad etiladi.`);
    } else {
      parent.set(rb, ra);
      st.accepted.push(k);
      st.total += e.weight ?? 0;
      for (const n of nodes) st.component[n] = find(n);
      rec.push(st, 6, `${e.from}–${e.to} (${e.weight}): connects two components. It is the cheapest edge crossing that cut, so by the cut property it belongs to some MST. Accept. Total ${st.total}.`, `${e.from}–${e.to} (${e.weight}): ikki component'ni bogʻlaydi. Bu kesimdan oʻtuvchi eng arzon edge, shuning uchun cut property boʻyicha u qandaydir MST'ga tegishli. Qabul. Jami ${st.total}.`);
    }
    if (st.accepted.length === nodes.length - 1) break;
  }
  st.i = null;
  const connected = st.accepted.length === nodes.length - 1;
  rec.push(st, 9, connected ? `MST with ${st.accepted.length} edges, weight ${st.total}. O(E log E) for the sort; union-find is near-constant.` : `Graph is disconnected: this is a minimum spanning forest (weight ${st.total}).`, connected ? `${st.accepted.length} edge'li MST, vazn ${st.total}. Saralash uchun O(E log E); union-find deyarli konstanta.` : `Graph bogʻlanmagan: bu minimum spanning forest (vazn ${st.total}).`);
  return rec.steps;
}

/** Prim's algorithm (O(V·E)) as a reference total for tests. */
export function mstWeightReference({ nodes, edges }: KruskalInput): number {
  if (nodes.length === 0) return 0;
  const inTree = new Set([nodes[0]]);
  let total = 0;
  for (;;) {
    let best: EdgeSpec | null = null;
    for (const e of edges) {
      const crosses = inTree.has(e.from) !== inTree.has(e.to);
      if (crosses && (!best || (e.weight ?? 0) < (best.weight ?? 0))) best = e;
    }
    if (!best) break;
    total += best.weight ?? 0;
    inTree.add(best.from);
    inTree.add(best.to);
  }
  return total;
}
