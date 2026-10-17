import { parseNumbers } from "../core/parse";
import { recorder } from "../core/recorder";
import { fail, type ParseResult } from "../core/types";

export const houseRobberCode = `function rob(nums: number[]): number {
  // dp[i] = best total using houses 0..i-1
  const dp = new Array<number>(nums.length + 1).fill(0);
  dp[1] = nums[0];
  for (let i = 2; i <= nums.length; i++) {
    dp[i] = Math.max(
      dp[i - 1],                  // skip house i-1
      dp[i - 2] + nums[i - 1],    // rob it: neighbour must be skipped
    );
  }
  return dp[nums.length];
}`;

export interface HouseRobberState {
  nums: number[];
  dp: (number | null)[];
  i: number | null;
  choice: "skip" | "rob" | null;
}

export function parseHouseRobber(raw: string): ParseResult<number[]> {
  const r = parseNumbers(raw, { min: 1, max: 12 });
  if (r.ok && r.value.some((x) => x < 0)) return fail("Amounts must be non-negative.", "Qiymatlar manfiy boʻlmasligi kerak.");
  return r;
}

export function houseRobberSteps(nums: number[]) {
  const rec = recorder<HouseRobberState>();
  const dp: (number | null)[] = nums.map(() => null);
  dp.push(null);
  dp[0] = 0;
  const st: HouseRobberState = { nums, dp, i: null, choice: null };
  rec.push(st, 3, `dp[0] = 0: with no houses you take nothing. The state is "best so far", not "which houses" — that is what makes it O(n).`, `dp[0] = 0: uy boʻlmasa hech narsa olinmaydi. Holat — "hozirgacha eng yaxshisi", "qaysi uylar" emas — aynan shu uni O(n) qiladi.`);
  dp[1] = nums[0];
  st.i = 1;
  rec.push(st, 4, `dp[1] = ${nums[0]}: one house — rob it.`, `dp[1] = ${nums[0]}: bitta uy — uni olamiz.`);
  for (let i = 2; i <= nums.length; i++) {
    st.i = i;
    const skip = dp[i - 1] as number;
    const take = (dp[i - 2] as number) + nums[i - 1];
    dp[i] = Math.max(skip, take);
    st.choice = take > skip ? "rob" : "skip";
    rec.push(st, 6, `House ${i - 1} (${nums[i - 1]}): skip → ${skip}, rob → dp[${i - 2}] + ${nums[i - 1]} = ${take}. Take ${dp[i]}.`, `${i - 1}-uy (${nums[i - 1]}): oʻtkazish → ${skip}, olish → dp[${i - 2}] + ${nums[i - 1]} = ${take}. ${dp[i]} tanlanadi.`);
  }
  st.i = null;
  st.choice = null;
  rec.push(st, 11, `Answer dp[${nums.length}] = ${dp[nums.length]}. Each state reads only the previous two, so two variables replace the array: O(1) space.`, `Javob dp[${nums.length}] = ${dp[nums.length]}. Har bir holat faqat oldingi ikkitasini oʻqiydi, shuning uchun array oʻrniga ikki oʻzgaruvchi yetadi: O(1) xotira.`);
  return rec.steps;
}

export function robBrute(nums: number[]): number {
  let best = 0;
  for (let mask = 0; mask < 1 << nums.length; mask++) {
    if (mask & (mask >> 1)) continue;
    let sum = 0;
    for (let i = 0; i < nums.length; i++) if (mask & (1 << i)) sum += nums[i];
    best = Math.max(best, sum);
  }
  return best;
}
