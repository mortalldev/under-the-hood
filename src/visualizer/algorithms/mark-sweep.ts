import { parseEdges, splitParts, type EdgeSpec } from "../core/parse";
import { recorder } from "../core/recorder";
import { fail, ok, type ParseResult } from "../core/types";
import { adjacency } from "./graph-traversal";

export const markSweepCode = `function collect(roots: Obj[], heap: Set<Obj>) {
  // Mark: everything reachable from the roots is live
  const work = [...roots];
  for (const r of roots) r.marked = true;
  while (work.length) {
    const obj = work.pop()!;
    for (const ref of obj.refs) {
      if (!ref.marked) { ref.marked = true; work.push(ref); }
    }
  }
  // Sweep: anything unmarked is garbage, even if it is referenced
  for (const obj of heap) {
    if (!obj.marked) heap.delete(obj);
    else obj.marked = false;           // reset for the next cycle
  }
}`;

export interface MarkSweepInput {
  nodes: string[];
  edges: EdgeSpec[];
  roots: string[];
}

export interface MarkSweepState {
  nodes: string[];
  edges: EdgeSpec[];
  roots: string[];
  marked: string[];
  work: string[];
  current: string | null;
  freed: string[];
  phase: "mark" | "sweep" | "done";
}

export function parseMarkSweep(raw: string): ParseResult<MarkSweepInput> {
  const parts = splitParts(raw, 2);
  if (!parts.ok) return parts;
  const roots = parts.value[0].split(",").map((s) => s.trim()).filter(Boolean);
  const g = parseEdges(parts.value[1], { directed: true, weighted: false });
  if (!g.ok) return g;
  const missing = roots.find((r) => !g.value.nodes.includes(r));
  if (missing) return fail(`Root "${missing}" does not appear in any reference.`, `"${missing}" root hech bir reference'da uchramaydi.`);
  if (roots.length === 0) return fail("Give at least one root.", "Kamida bitta root kiriting.");
  return ok({ ...g.value, roots });
}

export function markSweepSteps({ nodes, edges, roots }: MarkSweepInput) {
  const rec = recorder<MarkSweepState>();
  const adj = adjacency(nodes, edges, true);
  const st: MarkSweepState = { nodes, edges, roots, marked: [...roots], work: [...roots], current: null, freed: [], phase: "mark" };
  rec.push(st, 4, `Roots (${roots.join(", ")}) are what the program can touch directly: globals, the current call stack, registers. Mark them.`, `Root'lar (${roots.join(", ")}) — dastur toʻgʻridan-toʻgʻri tegadigan narsalar: global'lar, joriy call stack, registr'lar. Ularni belgilaymiz.`);
  while (st.work.length) {
    const u = st.work.pop() as string;
    st.current = u;
    rec.push(st, 6, `Scan ${u}'s references.`, `${u} ning reference'lari koʻrib chiqiladi.`);
    for (const v of adj.get(u) ?? []) {
      if (!st.marked.includes(v)) {
        st.marked.push(v);
        st.work.push(v);
        rec.push(st, 8, `${u} → ${v}: ${v} is reachable. Mark it and scan it later.`, `${u} → ${v}: ${v} yetib boriladigan. Belgilaymiz va keyinroq koʻrib chiqamiz.`);
      }
    }
  }
  st.current = null;
  st.phase = "sweep";
  const garbage = nodes.filter((n) => !st.marked.includes(n));
  rec.push(st, 12, `Mark phase done. Unmarked: ${garbage.join(", ") || "none"}.`, `Mark phase tugadi. Belgilanmagan: ${garbage.join(", ") || "yoʻq"}.`);
  for (const n of garbage) {
    st.freed.push(n);
    const referencedBy = edges.filter((e) => e.to === n).map((e) => e.from);
    rec.push(
      st,
      13,
      referencedBy.length ? `Free ${n} even though ${referencedBy.join(", ")} still point at it — those referrers are garbage too. Reference counting could not free this cycle; tracing can.` : `Free ${n}: nothing reachable points at it.`,
      referencedBy.length ? `${n} ozod qilinadi, garchi ${referencedBy.join(", ")} hali unga koʻrsatsa ham — ular ham chiqindi. Reference counting bu cycle'ni ozod qila olmasdi; tracing qila oladi.` : `${n} ozod qilinadi: unga hech bir yetib boriladigan narsa koʻrsatmaydi.`,
    );
  }
  st.phase = "done";
  rec.push(st, 15, `Survivors: ${st.marked.join(", ")}. V8 runs this idea generationally: frequent cheap scavenges of the young generation, rarer mark-sweep-compact of the old one, much of it incremental/concurrent.`, `Omon qolganlar: ${st.marked.join(", ")}. V8 bu gʻoyani generational tarzda ishlatadi: young generation'ni tez-tez arzon scavenge qilish, old generation'ni kamroq mark-sweep-compact qilish, asosan incremental/concurrent.`);
  return rec.steps;
}

export function reachable({ nodes, edges, roots }: MarkSweepInput): string[] {
  const adj = adjacency(nodes, edges, true);
  const seen = new Set(roots);
  const stack = [...roots];
  while (stack.length) for (const v of adj.get(stack.pop() as string) ?? []) if (!seen.has(v)) { seen.add(v); stack.push(v); }
  return nodes.filter((n) => seen.has(n));
}
