import { parseInteger, parseNumbers, splitParts } from "../core/parse";
import { recorder } from "../core/recorder";
import { fail, ok, type ParseResult } from "../core/types";

export const fenwickCode = `// tree is 1-indexed; tree[i] covers (i - lowbit(i), i]
const lowbit = (i: number) => i & -i;
function add(tree: number[], i: number, delta: number) {
  for (; i < tree.length; i += lowbit(i)) tree[i] += delta;
}
function prefixSum(tree: number[], i: number): number {
  let s = 0;
  for (; i > 0; i -= lowbit(i)) s += tree[i];
  return s;
}`;

export interface FenwickInput {
  nums: number[];
  query: number;
}

export interface FenwickState {
  nums: number[];
  tree: number[];
  i: number | null;
  phase: "build" | "query" | "done";
  sum: number;
  visited: number[];
}

export function parseFenwick(raw: string): ParseResult<FenwickInput> {
  const parts = splitParts(raw, 2);
  if (!parts.ok) return parts;
  const nums = parseNumbers(parts.value[0], { min: 1, max: 12 });
  if (!nums.ok) return nums;
  const q = parseInteger(parts.value[1], "i", 1, 12);
  if (!q.ok) return q;
  if (q.value > nums.value.length) return fail("Query index is past the end.", "Soʻrov indeksi array oxiridan oshib ketdi.");
  return ok({ nums: nums.value, query: q.value });
}

const bin = (n: number) => n.toString(2);

export function fenwickSteps({ nums, query }: FenwickInput) {
  const rec = recorder<FenwickState>();
  const tree = new Array<number>(nums.length + 1).fill(0);
  const st: FenwickState = { nums, tree, i: null, phase: "build", sum: 0, visited: [] };
  rec.push(st, 1, `Fenwick tree (BIT): tree[i] stores the sum of a block ending at i whose length is lowbit(i) — the lowest set bit of i.`, `Fenwick tree (BIT): tree[i] — i da tugaydigan, uzunligi lowbit(i) (i ning eng kichik 1-biti) boʻlgan blok yigʻindisi.`);

  nums.forEach((x, k) => {
    const touched: number[] = [];
    for (let i = k + 1; i < tree.length; i += i & -i) {
      tree[i] += x;
      touched.push(i);
    }
    st.visited = touched;
    rec.push(st, 4, `add(${k + 1}, ${x}) climbs i += lowbit(i): ${touched.join(" → ")}. Every block that contains position ${k + 1} is updated — O(log n) of them.`, `add(${k + 1}, ${x}) i += lowbit(i) boʻyicha koʻtariladi: ${touched.join(" → ")}. ${k + 1}-pozitsiyani oʻz ichiga olgan har bir blok yangilanadi — ular O(log n) ta.`);
  });

  st.phase = "query";
  st.visited = [];
  for (let i = query; i > 0; i -= i & -i) {
    st.i = i;
    st.sum += tree[i];
    st.visited.push(i);
    const from = i - (i & -i) + 1;
    rec.push(st, 8, `i = ${i} (${bin(i)}₂): add tree[${i}] = sum of positions ${from}..${i}. s = ${st.sum}. Then strip the lowest bit: ${i} − ${i & -i} = ${i - (i & -i)}.`, `i = ${i} (${bin(i)}₂): tree[${i}] = ${from}..${i} pozitsiyalar yigʻindisi qoʻshiladi. s = ${st.sum}. Keyin eng kichik bit olib tashlanadi: ${i} − ${i & -i} = ${i - (i & -i)}.`);
  }
  st.i = null;
  st.phase = "done";
  rec.push(st, 9, `prefixSum(${query}) = ${st.sum}, using ${st.visited.length} cells — at most the number of 1-bits in ${query}. Range sum (l, r] = prefixSum(r) − prefixSum(l).`, `prefixSum(${query}) = ${st.sum}, ${st.visited.length} ta katak ishlatildi — koʻpi bilan ${query} dagi 1-bitlar soni. (l, r] oraliq yigʻindisi = prefixSum(r) − prefixSum(l).`);
  return rec.steps;
}
