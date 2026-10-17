import { parseInteger, parseNumbers, splitParts } from "../core/parse";
import { recorder } from "../core/recorder";
import { ok, type ParseResult } from "../core/types";

export const prefixSumCode = `function subarraySum(nums: number[], k: number): number {
  const seen = new Map<number, number>([[0, 1]]); // prefix -> how many times
  let prefix = 0, count = 0;
  for (const x of nums) {
    prefix += x;
    count += seen.get(prefix - k) ?? 0;  // sum(j+1..i) = prefix[i] - prefix[j]
    seen.set(prefix, (seen.get(prefix) ?? 0) + 1);
  }
  return count;
}`;

export interface PrefixSumInput {
  nums: number[];
  k: number;
}

export interface PrefixSumState {
  nums: number[];
  i: number | null;
  prefix: number;
  seen: [number, number][];
  lookFor: number | null;
  hit: boolean;
  count: number;
}

export function parsePrefixSum(raw: string): ParseResult<PrefixSumInput> {
  const parts = splitParts(raw, 2);
  if (!parts.ok) return parts;
  const nums = parseNumbers(parts.value[0], { min: 1, max: 14 });
  if (!nums.ok) return nums;
  const k = parseInteger(parts.value[1], "k", -999, 999);
  if (!k.ok) return k;
  return ok({ nums: nums.value, k: k.value });
}

export function prefixSumSteps({ nums, k }: PrefixSumInput) {
  const rec = recorder<PrefixSumState>();
  const seen = new Map<number, number>([[0, 1]]);
  const st: PrefixSumState = { nums, i: null, prefix: 0, seen: [[0, 1]], lookFor: null, hit: false, count: 0 };
  rec.push(st, 2, `Seed seen = {0: 1}: the empty prefix lets a subarray that starts at index 0 be counted.`, `seen = {0: 1} bilan boshlaymiz: boʻsh prefix 0-indeksdan boshlanadigan subarray'ni ham hisoblashga imkon beradi.`);

  nums.forEach((x, i) => {
    st.i = i;
    st.prefix += x;
    st.lookFor = null;
    st.hit = false;
    rec.push(st, 5, `prefix += ${x} → ${st.prefix}. prefix is the sum of nums[0..${i}].`, `prefix += ${x} → ${st.prefix}. prefix — nums[0..${i}] yigʻindisi.`);

    st.lookFor = st.prefix - k;
    const c = seen.get(st.lookFor) ?? 0;
    st.hit = c > 0;
    st.count += c;
    rec.push(
      st,
      6,
      c > 0
        ? `Need an earlier prefix equal to ${st.prefix} - ${k} = ${st.lookFor}. It occurred ${c}×, so ${c} subarray(s) ending at ${i} sum to ${k}. count = ${st.count}.`
        : `Need an earlier prefix equal to ${st.prefix} - ${k} = ${st.lookFor}. Not seen yet — no subarray ending at ${i} sums to ${k}.`,
      c > 0
        ? `${st.prefix} - ${k} = ${st.lookFor} ga teng oldingi prefix kerak. U ${c} marta uchragan, demak ${i} da tugaydigan ${c} ta subarray yigʻindisi ${k}. count = ${st.count}.`
        : `${st.prefix} - ${k} = ${st.lookFor} ga teng oldingi prefix kerak. Hali uchramagan — ${i} da tugaydigan hech bir subarray yigʻindisi ${k} emas.`,
    );

    seen.set(st.prefix, (seen.get(st.prefix) ?? 0) + 1);
    st.seen = [...seen.entries()];
    rec.push(st, 7, `Store prefix ${st.prefix} only now — after the lookup — so a subarray can never be empty.`, `prefix ${st.prefix} ni faqat endi — qidiruvdan keyin — saqlaymiz, shunda subarray hech qachon boʻsh boʻlmaydi.`);
  });

  st.i = null;
  st.lookFor = null;
  st.hit = false;
  rec.push(st, 9, `Done in one pass: O(n) time, O(n) space. Works with negative numbers, unlike a sliding window. Answer: ${st.count}.`, `Bitta oʻtishda tugadi: O(n) vaqt, O(n) xotira. Sliding window'dan farqli, manfiy sonlar bilan ham ishlaydi. Javob: ${st.count}.`);
  return rec.steps;
}

export function subarraySumBrute(nums: number[], k: number): number {
  let count = 0;
  for (let i = 0; i < nums.length; i++) {
    let sum = 0;
    for (let j = i; j < nums.length; j++) {
      sum += nums[j];
      if (sum === k) count++;
    }
  }
  return count;
}
