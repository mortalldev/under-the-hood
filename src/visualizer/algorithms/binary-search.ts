import { parseInteger, parseNumbers, splitParts } from "../core/parse";
import { recorder } from "../core/recorder";
import { fail, ok, type ParseResult } from "../core/types";

export const binarySearchCode = `function lowerBound(nums: number[], target: number): number {
  let lo = 0, hi = nums.length;   // answer is always in [lo, hi]
  while (lo < hi) {
    const mid = lo + ((hi - lo) >> 1);
    if (nums[mid] < target) {
      lo = mid + 1;               // mid and everything left are too small
    } else {
      hi = mid;                   // mid may be the answer: keep it
    }
  }
  return lo;                      // first index with nums[i] >= target
}`;

export interface BinarySearchInput {
  nums: number[];
  target: number;
}

export interface BinarySearchState {
  nums: number[];
  target: number;
  lo: number;
  hi: number;
  mid: number | null;
  result: number | null;
}

export function parseBinarySearch(raw: string): ParseResult<BinarySearchInput> {
  const parts = splitParts(raw, 2);
  if (!parts.ok) return parts;
  const nums = parseNumbers(parts.value[0], { min: 1, max: 16 });
  if (!nums.ok) return nums;
  for (let i = 1; i < nums.value.length; i++) {
    if (nums.value[i] < nums.value[i - 1]) {
      return fail("Binary search needs a sorted (non-decreasing) array.", "Binary search uchun array saralangan (kamaymaydigan) boʻlishi kerak.");
    }
  }
  const target = parseInteger(parts.value[1], "target", -999, 999);
  if (!target.ok) return target;
  return ok({ nums: nums.value, target: target.value });
}

export function binarySearchSteps({ nums, target }: BinarySearchInput) {
  const rec = recorder<BinarySearchState>();
  const st: BinarySearchState = { nums, target, lo: 0, hi: nums.length, mid: null, result: null };
  rec.push(st, 2, `Search space is the half-open range [0, ${nums.length}). hi = n is a valid answer: "every element is smaller than ${target}".`, `Qidiruv maydoni — yarim ochiq [0, ${nums.length}) oraligʻi. hi = n ham toʻgʻri javob boʻla oladi: "barcha elementlar ${target} dan kichik".`);

  while (st.lo < st.hi) {
    const mid = st.lo + ((st.hi - st.lo) >> 1);
    st.mid = mid;
    rec.push(st, 4, `lo = ${st.lo}, hi = ${st.hi}. mid = ${mid}. Written as lo + (hi - lo) / 2 so it cannot overflow in fixed-width languages.`, `lo = ${st.lo}, hi = ${st.hi}. mid = ${mid}. lo + (hi - lo) / 2 shaklida yozilgan — fixed-width tillarda overflow boʻlmasligi uchun.`);
    if (nums[mid] < target) {
      st.lo = mid + 1;
      rec.push(st, 6, `nums[${mid}] = ${nums[mid]} < ${target}: the answer is strictly right of mid. Discard [.., ${mid}] → lo = ${st.lo}.`, `nums[${mid}] = ${nums[mid]} < ${target}: javob mid'dan qat'iy oʻngda. [.., ${mid}] tashlanadi → lo = ${st.lo}.`);
    } else {
      st.hi = mid;
      rec.push(st, 8, `nums[${mid}] = ${nums[mid]} ≥ ${target}: mid could be the first such index, so keep it — hi = ${mid}.`, `nums[${mid}] = ${nums[mid]} ≥ ${target}: mid birinchi shunday indeks boʻlishi mumkin, shuning uchun uni saqlaymiz — hi = ${mid}.`);
    }
  }
  st.mid = null;
  st.result = st.lo;
  const where =
    st.lo < nums.length
      ? { en: `nums[${st.lo}] = ${nums[st.lo]} is the first element ≥ ${target}.`, uz: `nums[${st.lo}] = ${nums[st.lo]} — ${target} dan katta yoki teng birinchi element.` }
      : { en: `Every element is < ${target}, so the insertion point is the end.`, uz: `Barcha elementlar < ${target}, shuning uchun qoʻyish nuqtasi — oxiri.` };
  rec.push(st, 11, `lo == hi = ${st.lo}: the range collapsed to one candidate. ${where.en} Each iteration halved the range → O(log n).`, `lo == hi = ${st.lo}: oraliq bitta nomzodga qisqardi. ${where.uz} Har bir iteratsiya oraliqni ikki baravar qisqartirdi → O(log n).`);
  return rec.steps;
}

export function lowerBoundLinear(nums: number[], target: number): number {
  const i = nums.findIndex((x) => x >= target);
  return i === -1 ? nums.length : i;
}
