import { parseEdges, type EdgeSpec } from "../core/parse";
import { recorder } from "../core/recorder";
import type { ParseResult } from "../core/types";

export const unionFindCode = `const parent = nodes.map((_, i) => i);
const rank = nodes.map(() => 0);
function find(x: number): number {
  if (parent[x] !== x) parent[x] = find(parent[x]); // path compression
  return parent[x];
}
function union(a: number, b: number): boolean {
  let ra = find(a), rb = find(b);
  if (ra === rb) return false;              // same set ⇒ this edge closes a cycle
  if (rank[ra] < rank[rb]) [ra, rb] = [rb, ra];
  parent[rb] = ra;                          // hang the shorter tree under the taller
  if (rank[ra] === rank[rb]) rank[ra]++;
  return true;
}`;

export interface UnionFindInput {
  nodes: string[];
  edges: EdgeSpec[];
}

export interface UnionFindState {
  nodes: string[];
  parent: number[];
  rank: number[];
  edge: [string, string] | null;
  roots: [number, number] | null;
  path: number[];
  redundant: [string, string][];
  accepted: [string, string][];
}

export const parseUnionFind = (raw: string): ParseResult<UnionFindInput> =>
  parseEdges(raw, { directed: false, weighted: false });

export function unionFindSteps({ nodes, edges }: UnionFindInput) {
  const rec = recorder<UnionFindState>();
  const idx = new Map(nodes.map((n, i) => [n, i]));
  const st: UnionFindState = {
    nodes,
    parent: nodes.map((_, i) => i),
    rank: nodes.map(() => 0),
    edge: null,
    roots: null,
    path: [],
    redundant: [],
    accepted: [],
  };
  rec.push(st, 1, `Every node starts as its own set: parent[x] = x. A set is identified by its root.`, `Har bir node oʻz set'i sifatida boshlanadi: parent[x] = x. Set uning root'i orqali aniqlanadi.`);

  const find = (x: number): number => {
    const path: number[] = [];
    let r = x;
    while (st.parent[r] !== r) {
      path.push(r);
      r = st.parent[r];
    }
    path.push(r);
    st.path = path;
    const compressed = path.slice(0, -2);
    if (compressed.length > 0) {
      for (const p of compressed) st.parent[p] = r;
      rec.push(st, 4, `find(${nodes[x]}) walked ${path.map((p) => nodes[p]).join(" → ")}. Path compression points ${compressed.map((p) => nodes[p]).join(", ")} straight at root ${nodes[r]} — later finds are O(1).`, `find(${nodes[x]}) ${path.map((p) => nodes[p]).join(" → ")} boʻylab yurdi. Path compression ${compressed.map((p) => nodes[p]).join(", ")} ni toʻgʻridan-toʻgʻri root ${nodes[r]} ga ulaydi — keyingi find'lar O(1).`);
    }
    return r;
  };

  for (const e of edges) {
    const a = idx.get(e.from) as number;
    const b = idx.get(e.to) as number;
    st.edge = [e.from, e.to];
    st.path = [];
    st.roots = null;
    rec.push(st, 7, `union(${e.from}, ${e.to}).`, `union(${e.from}, ${e.to}).`);
    let ra = find(a);
    let rb = find(b);
    st.roots = [ra, rb];
    if (ra === rb) {
      st.redundant.push([e.from, e.to]);
      rec.push(st, 9, `Both have root ${nodes[ra]}: already connected. Adding ${e.from}–${e.to} would create a cycle (this is how Kruskal rejects an edge).`, `Ikkalasining root'i ${nodes[ra]}: allaqachon bogʻlangan. ${e.from}–${e.to} qoʻshilsa cycle hosil boʻladi (Kruskal edge'ni aynan shunday rad etadi).`);
      continue;
    }
    if (st.rank[ra] < st.rank[rb]) [ra, rb] = [rb, ra];
    st.parent[rb] = ra;
    const grew = st.rank[ra] === st.rank[rb];
    if (grew) st.rank[ra]++;
    st.accepted.push([e.from, e.to]);
    st.path = [];
    rec.push(st, 11, `Roots differ. Attach ${nodes[rb]} (rank ${st.rank[rb]}) under ${nodes[ra]}${grew ? `; equal ranks, so ${nodes[ra]}'s rank becomes ${st.rank[ra]}` : ""}. Union by rank keeps trees O(log n) tall.`, `Root'lar har xil. ${nodes[rb]} (rank ${st.rank[rb]}) ${nodes[ra]} ostiga ulanadi${grew ? `; rank'lar teng, shuning uchun ${nodes[ra]} rank'i ${st.rank[ra]} boʻladi` : ""}. Union by rank daraxtlarni O(log n) balandlikda saqlaydi.`);
  }
  st.edge = null;
  st.roots = null;
  st.path = [];
  const sets = new Set(st.parent.map((_, i) => {
    let r = i;
    while (st.parent[r] !== r) r = st.parent[r];
    return r;
  })).size;
  rec.push(st, 13, `${sets} connected component(s). With both optimizations each operation is O(α(n)) amortized — effectively constant.`, `${sets} ta connected component. Ikkala optimizatsiya bilan har bir amal amortized O(α(n)) — amalda konstanta.`);
  return rec.steps;
}

export function componentCount(nodes: string[], edges: EdgeSpec[]): number {
  const seen = new Set<string>();
  let count = 0;
  for (const n of nodes) {
    if (seen.has(n)) continue;
    count++;
    const stack = [n];
    seen.add(n);
    while (stack.length) {
      const u = stack.pop() as string;
      for (const e of edges) {
        const v = e.from === u ? e.to : e.to === u ? e.from : null;
        if (v && !seen.has(v)) {
          seen.add(v);
          stack.push(v);
        }
      }
    }
  }
  return count;
}
