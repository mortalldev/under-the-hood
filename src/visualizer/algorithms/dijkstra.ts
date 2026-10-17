import { parseEdges, splitParts, type EdgeSpec } from "../core/parse";
import { recorder } from "../core/recorder";
import { fail, ok, type ParseResult } from "../core/types";

export const dijkstraCode = `function dijkstra(adj: Map<string, [string, number][]>, src: string) {
  const dist = new Map<string, number>([[src, 0]]);
  const pq = new MinHeap<[number, string]>([[0, src]]);
  const done = new Set<string>();
  while (pq.size) {
    const [d, u] = pq.pop()!;
    if (done.has(u)) continue;           // stale entry (lazy deletion)
    done.add(u);                         // d is final: weights are ≥ 0
    for (const [v, w] of adj.get(u) ?? []) {
      const nd = d + w;
      if (nd < (dist.get(v) ?? Infinity)) {
        dist.set(v, nd);                 // relax
        pq.push([nd, v]);
      }
    }
  }
  return dist;
}`;

export interface DijkstraInput {
  nodes: string[];
  edges: EdgeSpec[];
  start: string;
}

export interface DijkstraState {
  nodes: string[];
  edges: EdgeSpec[];
  dist: Record<string, number>;
  prev: Record<string, string>;
  pq: [number, string][];
  done: string[];
  current: string | null;
  relax: [string, string] | null;
  improved: boolean | null;
}

export function parseDijkstra(raw: string): ParseResult<DijkstraInput> {
  const parts = splitParts(raw, 2);
  if (!parts.ok) return parts;
  const g = parseEdges(parts.value[0], { directed: false, weighted: true });
  if (!g.ok) return g;
  if (!g.value.nodes.includes(parts.value[1])) return fail("Start node is not in the graph.", "Boshlangʻich node graph'da yoʻq.");
  return ok({ ...g.value, start: parts.value[1] });
}

function weightedAdjacency(nodes: string[], edges: EdgeSpec[]) {
  const adj = new Map<string, [string, number][]>(nodes.map((n) => [n, []]));
  for (const e of edges) {
    adj.get(e.from)?.push([e.to, e.weight ?? 1]);
    adj.get(e.to)?.push([e.from, e.weight ?? 1]);
  }
  return adj;
}

export function dijkstraSteps({ nodes, edges, start }: DijkstraInput) {
  const rec = recorder<DijkstraState>();
  const adj = weightedAdjacency(nodes, edges);
  const st: DijkstraState = { nodes, edges, dist: { [start]: 0 }, prev: {}, pq: [[0, start]], done: [], current: null, relax: null, improved: null };
  const sortPq = () => st.pq.sort((a, b) => a[0] - b[0] || a[1].localeCompare(b[1]));
  rec.push(st, 3, `dist[${start}] = 0, everything else ∞. The priority queue always yields the closest unsettled node.`, `dist[${start}] = 0, qolganlari ∞. Priority queue doim eng yaqin hali yakunlanmagan node'ni beradi.`);

  while (st.pq.length) {
    const [d, u] = st.pq.shift() as [number, string];
    st.current = u;
    st.relax = null;
    st.improved = null;
    if (st.done.includes(u)) {
      rec.push(st, 7, `Pop (${d}, ${u}) — ${u} is already settled; this is a stale duplicate. Skipping it is cheaper than a decrease-key operation.`, `(${d}, ${u}) olinadi — ${u} allaqachon yakunlangan; bu eskirgan dublikat. Uni tashlab ketish decrease-key amalidan arzonroq.`);
      continue;
    }
    st.done.push(u);
    rec.push(st, 8, `Pop (${d}, ${u}): settle ${u} at ${d}. Any other route would go through a node at distance ≥ ${d} and add non-negative weights, so it cannot be shorter.`, `(${d}, ${u}) olinadi: ${u} ${d} masofada yakunlanadi. Boshqa har qanday yoʻl ≥ ${d} masofadagi node orqali oʻtib, manfiy boʻlmagan vaznlar qoʻshadi — qisqaroq boʻla olmaydi.`);
    for (const [v, w] of adj.get(u) ?? []) {
      if (st.done.includes(v)) continue;
      st.relax = [u, v];
      const nd = d + w;
      const old = st.dist[v];
      if (old === undefined || nd < old) {
        st.dist[v] = nd;
        st.prev[v] = u;
        st.pq.push([nd, v]);
        sortPq();
        st.improved = true;
        rec.push(st, 12, `Relax ${u}–${v} (w=${w}): ${d} + ${w} = ${nd} < ${old ?? "∞"} → dist[${v}] = ${nd}, push (${nd}, ${v}).`, `${u}–${v} (w=${w}) relax: ${d} + ${w} = ${nd} < ${old ?? "∞"} → dist[${v}] = ${nd}, (${nd}, ${v}) qoʻshiladi.`);
      } else {
        st.improved = false;
        rec.push(st, 11, `Relax ${u}–${v} (w=${w}): ${nd} ≥ ${old} — no improvement.`, `${u}–${v} (w=${w}) relax: ${nd} ≥ ${old} — yaxshilanish yoʻq.`);
      }
    }
  }
  st.current = null;
  st.relax = null;
  st.improved = null;
  rec.push(st, 17, `All reachable nodes settled. O((V + E) log V) with a binary heap. Negative edges break the "settled is final" argument → use Bellman-Ford.`, `Barcha yetib boriladigan node'lar yakunlandi. Binary heap bilan O((V + E) log V). Manfiy edge'lar "yakunlangan = final" dalilini buzadi → Bellman-Ford ishlating.`);
  return rec.steps;
}

/** Bellman-Ford reference for tests. */
export function shortestReference({ nodes, edges, start }: DijkstraInput): Record<string, number> {
  const dist: Record<string, number> = { [start]: 0 };
  for (let k = 0; k < nodes.length; k++) {
    for (const e of edges) {
      const w = e.weight ?? 1;
      for (const [a, b] of [[e.from, e.to], [e.to, e.from]]) {
        if (dist[a] !== undefined && (dist[b] === undefined || dist[a] + w < dist[b])) dist[b] = dist[a] + w;
      }
    }
  }
  return dist;
}
