import { parseEdges, type EdgeSpec } from "../core/parse";
import { recorder } from "../core/recorder";
import type { ParseResult } from "../core/types";
import { adjacency } from "./graph-traversal";

export const topoCode = `function topoSort(nodes: string[], edges: [string, string][]) {
  const indeg = new Map(nodes.map((v) => [v, 0]));
  const adj = new Map(nodes.map((v) => [v, [] as string[]]));
  for (const [a, b] of edges) { adj.get(a)!.push(b); indeg.set(b, indeg.get(b)! + 1); }
  const queue = nodes.filter((v) => indeg.get(v) === 0); // no prerequisites
  const order: string[] = [];
  for (let head = 0; head < queue.length; head++) {
    const u = queue[head];
    order.push(u);
    for (const v of adj.get(u)!) {
      indeg.set(v, indeg.get(v)! - 1);   // u is done: one prerequisite fewer
      if (indeg.get(v) === 0) queue.push(v);
    }
  }
  return order.length === nodes.length ? order : null; // leftovers ⇒ cycle
}`;

export interface TopoInput {
  nodes: string[];
  edges: EdgeSpec[];
}

export interface TopoState {
  nodes: string[];
  edges: EdgeSpec[];
  indeg: Record<string, number>;
  queue: string[];
  order: string[];
  current: string | null;
  removed: string[];
  cycle: string[] | null;
}

export function parseTopo(raw: string): ParseResult<TopoInput> {
  return parseEdges(raw, { directed: true, weighted: false });
}

export function topoSteps({ nodes, edges }: TopoInput) {
  const rec = recorder<TopoState>();
  const adj = adjacency(nodes, edges, true);
  const indeg: Record<string, number> = Object.fromEntries(nodes.map((n) => [n, 0]));
  for (const e of edges) indeg[e.to]++;
  const st: TopoState = { nodes, edges, indeg, queue: [], order: [], current: null, removed: [], cycle: null };
  rec.push(st, 4, `In-degree = number of prerequisites. A > B means "A must come before B".`, `In-degree — oldindan bajarilishi kerak boʻlganlar soni. A > B — "A B dan oldin kelishi shart".`);
  st.queue = nodes.filter((n) => indeg[n] === 0);
  rec.push(st, 5, `Nodes with in-degree 0 can go first: ${st.queue.join(", ") || "none"}.`, `In-degree 0 boʻlgan node'lar birinchi kela oladi: ${st.queue.join(", ") || "yoʻq"}.`);

  while (st.queue.length) {
    const u = st.queue.shift() as string;
    st.current = u;
    st.order.push(u);
    rec.push(st, 9, `Take ${u} and append it to the order.`, `${u} olinib tartibga qoʻshiladi.`);
    for (const v of adj.get(u) ?? []) {
      indeg[v]--;
      st.removed.push(`${u}>${v}`);
      if (indeg[v] === 0) {
        st.queue.push(v);
        rec.push(st, 12, `Remove ${u} > ${v}: ${v} has no prerequisites left → ready.`, `${u} > ${v} olib tashlanadi: ${v} ning boshqa sharti qolmadi → tayyor.`);
      } else {
        rec.push(st, 11, `Remove ${u} > ${v}: ${v} still waits on ${indeg[v]} more.`, `${u} > ${v} olib tashlanadi: ${v} yana ${indeg[v]} ta shartni kutmoqda.`);
      }
    }
  }
  st.current = null;
  if (st.order.length < nodes.length) {
    st.cycle = nodes.filter((n) => !st.order.includes(n));
    rec.push(st, 15, `Stuck: ${st.cycle.join(", ")} never reach in-degree 0 — they are on or behind a cycle, so no valid order exists.`, `Tiqilib qoldi: ${st.cycle.join(", ")} hech qachon in-degree 0 ga yetmaydi — ular cycle ustida yoki uning ortida, shuning uchun toʻgʻri tartib mavjud emas.`);
  } else {
    rec.push(st, 15, `Order: ${st.order.join(" → ")}. Every edge points forward in this order. O(V + E).`, `Tartib: ${st.order.join(" → ")}. Har bir edge bu tartibda oldinga yoʻnalgan. O(V + E).`);
  }
  return rec.steps;
}

export function isTopological(order: string[], edges: EdgeSpec[]): boolean {
  const pos = new Map(order.map((n, i) => [n, i]));
  return edges.every((e) => (pos.get(e.from) ?? Infinity) < (pos.get(e.to) ?? -Infinity));
}
