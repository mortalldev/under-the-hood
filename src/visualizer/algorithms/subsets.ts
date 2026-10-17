import { parseNumbers } from "../core/parse";
import { recorder } from "../core/recorder";
import type { ParseResult } from "../core/types";

export const subsetsCode = `function subsets(nums: number[]): number[][] {
  const out: number[][] = [];
  const path: number[] = [];
  function backtrack(start: number) {
    out.push([...path]);          // every node of the tree is a subset
    for (let i = start; i < nums.length; i++) {
      path.push(nums[i]);         // choose
      backtrack(i + 1);           // explore
      path.pop();                 // un-choose (restore state)
    }
  }
  backtrack(0);
  return out;
}`;

export interface SubsetsState {
  nums: number[];
  frames: { id: number; start: number }[];
  path: number[];
  out: number[][];
  i: number | null;
}

export const parseSubsets = (raw: string): ParseResult<number[]> => parseNumbers(raw, { min: 1, max: 4, label: "nums" });

export function subsetsSteps(nums: number[]) {
  const rec = recorder<SubsetsState>();
  const st: SubsetsState = { nums, frames: [], path: [], out: [], i: null };
  let frameId = 0;

  const backtrack = (start: number) => {
    st.frames.push({ id: frameId++, start });
    st.i = null;
    st.out.push([...st.path]);
    rec.push(st, 5, `backtrack(${start}): record [${st.path.join(", ")}] — subset #${st.out.length}.`, `backtrack(${start}): [${st.path.join(", ")}] yoziladi — ${st.out.length}-subset.`);
    for (let i = start; i < nums.length; i++) {
      st.i = i;
      st.path.push(nums[i]);
      rec.push(st, 7, `Choose nums[${i}] = ${nums[i]} → path [${st.path.join(", ")}]. Only indices > ${i} may follow, so each set appears once (no [2,1] after [1,2]).`, `nums[${i}] = ${nums[i]} tanlanadi → path [${st.path.join(", ")}]. Faqat ${i} dan katta indekslar keyin kela oladi, shuning uchun har bir set bir marta chiqadi ([1,2] dan keyin [2,1] yoʻq).`);
      backtrack(i + 1);
      st.i = i;
      st.path.pop();
      rec.push(st, 9, `Back in backtrack(${start}): un-choose ${nums[i]} → path [${st.path.join(", ")}]. Undoing restores the exact state the next branch expects.`, `backtrack(${start}) ga qaytdik: ${nums[i]} bekor qilinadi → path [${st.path.join(", ")}]. Bekor qilish keyingi tarmoq kutgan aniq holatni tiklaydi.`);
    }
    st.frames.pop();
    st.i = null;
    rec.push(st, 10, `backtrack(${start}) returns.`, `backtrack(${start}) qaytadi.`);
  };

  rec.push(st, 12, `Start the recursion. Every node of the call tree is one subset, and there are 2^n of them.`, `Recursion boshlanadi. Chaqiruvlar daraxtining har bir node'i — bitta subset, ular jami 2^n ta.`);
  backtrack(0);
  rec.push(st, 13, `${st.out.length} = 2^${nums.length} subsets. Time O(n · 2^n) (copying each), recursion depth O(n).`, `${st.out.length} = 2^${nums.length} ta subset. Vaqt O(n · 2^n) (har birini nusxalash), recursion chuqurligi O(n).`);
  return rec.steps;
}
