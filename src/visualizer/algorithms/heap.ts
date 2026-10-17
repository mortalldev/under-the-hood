import { parseInteger, parseNumbers, splitParts } from "../core/parse";
import { recorder } from "../core/recorder";
import { fail, ok, type ParseResult } from "../core/types";

export const topKCode = `function topK(nums: number[], k: number): number[] {
  const heap: number[] = [];               // min-heap of size ≤ k
  for (const x of nums) {
    push(heap, x);                         // append, then sift up
    if (heap.length > k) pop(heap);        // evict the smallest
  }
  return heap;                             // the k largest
}
// parent(i) = (i - 1) >> 1, children = 2i + 1, 2i + 2
function siftUp(h: number[], i: number) {
  while (i > 0 && h[(i - 1) >> 1] > h[i]) {
    [h[i], h[(i - 1) >> 1]] = [h[(i - 1) >> 1], h[i]];
    i = (i - 1) >> 1;
  }
}
function siftDown(h: number[], i: number) {
  for (;;) {
    let m = i;
    for (const c of [2 * i + 1, 2 * i + 2]) if (c < h.length && h[c] < h[m]) m = c;
    if (m === i) return;
    [h[i], h[m]] = [h[m], h[i]];
    i = m;
  }
}`;

export interface TopKInput {
  nums: number[];
  k: number;
}

export interface HeapState {
  nums: number[];
  i: number | null;
  heap: number[];
  focus: number[];
  swapped: number[];
  evicted: number[];
}

export function parseTopK(raw: string): ParseResult<TopKInput> {
  const parts = splitParts(raw, 2);
  if (!parts.ok) return parts;
  const nums = parseNumbers(parts.value[0], { min: 1, max: 12 });
  if (!nums.ok) return nums;
  const k = parseInteger(parts.value[1], "k", 1, 6);
  if (!k.ok) return k;
  if (k.value > nums.value.length) return fail("k cannot exceed the array length.", "k array uzunligidan oshmasligi kerak.");
  return ok({ nums: nums.value, k: k.value });
}

export function topKSteps({ nums, k }: TopKInput) {
  const rec = recorder<HeapState>();
  const st: HeapState = { nums, i: null, heap: [], focus: [], swapped: [], evicted: [] };
  const h = st.heap;
  rec.push(st, 2, `Keep a MIN-heap of the k = ${k} largest values seen so far. Its root is the weakest member — the one to evict.`, `Hozirgacha koʻrilgan k = ${k} ta eng katta qiymatni MIN-heap'da saqlaymiz. Ildiz — eng kuchsiz a'zo, aynan u chiqariladi.`);

  nums.forEach((x, idx) => {
    st.i = idx;
    h.push(x);
    let i = h.length - 1;
    st.focus = [i];
    st.swapped = [];
    rec.push(st, 4, `Push ${x}: append at index ${i} (keeps the tree complete).`, `${x} push: ${i}-indeksga qoʻshiladi (daraxt toʻliqligicha qoladi).`);
    while (i > 0 && h[(i - 1) >> 1] > h[i]) {
      const p = (i - 1) >> 1;
      st.focus = [p, i];
      rec.push(st, 11, `Parent ${h[p]} > child ${h[i]}: heap property violated.`, `Ota ${h[p]} > bola ${h[i]}: heap xossasi buzildi.`);
      [h[i], h[p]] = [h[p], h[i]];
      st.swapped = [p, i];
      rec.push(st, 12, `Swap up. At most log₂(size) swaps.`, `Yuqoriga almashtiramiz. Koʻpi bilan log₂(size) ta almashtirish.`);
      i = p;
    }
    st.focus = [];
    st.swapped = [];

    if (h.length > k) {
      const smallest = h[0];
      st.focus = [0];
      rec.push(st, 5, `Size ${h.length} > k. Root ${smallest} is the smallest of the ${h.length} → it cannot be in the top ${k}. Evict it.`, `Hajm ${h.length} > k. Ildiz ${smallest} — ${h.length} ta ichida eng kichigi → u top ${k} da boʻla olmaydi. Chiqaramiz.`);
      const lastVal = h.pop() as number;
      st.evicted.push(smallest);
      if (h.length > 0) {
        h[0] = lastVal;
        let j = 0;
        st.focus = [0];
        rec.push(st, 17, `Move the last element ${lastVal} to the root, then sift down.`, `Oxirgi element ${lastVal} ildizga koʻchiriladi, keyin pastga sift qilinadi.`);
        for (;;) {
          let m = j;
          for (const c of [2 * j + 1, 2 * j + 2]) if (c < h.length && h[c] < h[m]) m = c;
          if (m === j) break;
          st.focus = [j, m];
          rec.push(st, 21, `Smaller child ${h[m]} < ${h[j]}: swap down.`, `Kichikroq bola ${h[m]} < ${h[j]}: pastga almashtiramiz.`);
          [h[j], h[m]] = [h[m], h[j]];
          st.swapped = [j, m];
          j = m;
        }
        st.swapped = [];
      }
      st.focus = [];
      rec.push(st, 5, `Heap holds the top ${k} of the first ${idx + 1} values.`, `Heap birinchi ${idx + 1} ta qiymatning top ${k} tasini saqlaydi.`);
    }
  });
  st.i = null;
  rec.push(st, 7, `Top ${k}: ${[...h].sort((a, b) => b - a).join(", ")}. O(n log k) time, O(k) space — better than sorting (n log n) when k ≪ n.`, `Top ${k}: ${[...h].sort((a, b) => b - a).join(", ")}. O(n log k) vaqt, O(k) xotira — k ≪ n boʻlganda saralashdan (n log n) yaxshiroq.`);
  return rec.steps;
}

export function isMinHeap(h: readonly number[]): boolean {
  return h.every((v, i) => i === 0 || h[(i - 1) >> 1] <= v);
}
