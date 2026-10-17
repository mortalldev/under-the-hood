import { parseInteger, parseNumbers, splitParts } from "../core/parse";
import { recorder } from "../core/recorder";
import { fail, ok, type ParseResult } from "../core/types";

export const twoPointersCode = `function twoSumSorted(nums: number[], target: number): [number, number] | null {
  let l = 0, r = nums.length - 1;
  while (l < r) {
    const sum = nums[l] + nums[r];
    if (sum === target) return [l, r];
    if (sum < target) l++;   // only moving l can increase the sum
    else r--;                // only moving r can decrease it
  }
  return null;
}`;

export interface TwoPointersInput {
  nums: number[];
  target: number;
}

export interface TwoPointersState {
  nums: number[];
  l: number;
  r: number;
  sum: number | null;
  found: boolean;
  done: boolean;
}

export function parseTwoPointers(raw: string): ParseResult<TwoPointersInput> {
  const parts = splitParts(raw, 2);
  if (!parts.ok) return parts;
  const nums = parseNumbers(parts.value[0], { min: 2, max: 14 });
  if (!nums.ok) return nums;
  if (nums.value.some((x, i) => i > 0 && x < nums.value[i - 1])) {
    return fail("The array must be sorted.", "Array saralangan boʻlishi kerak.");
  }
  const target = parseInteger(parts.value[1], "target", -1998, 1998);
  if (!target.ok) return target;
  return ok({ nums: nums.value, target: target.value });
}

export function twoPointersSteps({ nums, target }: TwoPointersInput) {
  const rec = recorder<TwoPointersState>();
  const st: TwoPointersState = { nums, l: 0, r: nums.length - 1, sum: null, found: false, done: false };
  rec.push(st, 2, `l at the smallest value, r at the largest. Every pair (i, j) with l ≤ i < j ≤ r is still a candidate.`, `l eng kichik qiymatda, r eng kattasida. l ≤ i < j ≤ r boʻlgan har bir (i, j) juftlik hali nomzod.`);

  while (st.l < st.r) {
    st.sum = nums[st.l] + nums[st.r];
    rec.push(st, 4, `sum = nums[${st.l}] + nums[${st.r}] = ${nums[st.l]} + ${nums[st.r]} = ${st.sum}.`, `sum = nums[${st.l}] + nums[${st.r}] = ${nums[st.l]} + ${nums[st.r]} = ${st.sum}.`);
    if (st.sum === target) {
      st.found = true;
      st.done = true;
      rec.push(st, 5, `${st.sum} == ${target}: found the pair (${st.l}, ${st.r}).`, `${st.sum} == ${target}: juftlik topildi (${st.l}, ${st.r}).`);
      return rec.steps;
    }
    if (st.sum < target) {
      rec.push(st, 6, `${st.sum} < ${target}. nums[${st.l}] paired with the largest remaining value is still too small, so nums[${st.l}] cannot be in any answer — drop it: l++.`, `${st.sum} < ${target}. nums[${st.l}] qolganlarning eng kattasi bilan ham kichik, demak nums[${st.l}] hech bir javobda boʻla olmaydi — tashlaymiz: l++.`);
      st.l++;
    } else {
      rec.push(st, 7, `${st.sum} > ${target}. nums[${st.r}] with the smallest remaining value is already too big, so nums[${st.r}] is useless — drop it: r--.`, `${st.sum} > ${target}. nums[${st.r}] qolganlarning eng kichigi bilan ham katta, demak nums[${st.r}] foydasiz — tashlaymiz: r--.`);
      st.r--;
    }
  }
  st.sum = null;
  st.done = true;
  rec.push(st, 9, `Pointers met: no pair sums to ${target}. Each step eliminated one element → O(n) time, O(1) space.`, `Pointer'lar uchrashdi: yigʻindisi ${target} boʻlgan juftlik yoʻq. Har qadamda bitta element chiqarildi → O(n) vaqt, O(1) xotira.`);
  return rec.steps;
}

export function twoSumBrute(nums: number[], target: number): boolean {
  for (let i = 0; i < nums.length; i++) {
    for (let j = i + 1; j < nums.length; j++) if (nums[i] + nums[j] === target) return true;
  }
  return false;
}
