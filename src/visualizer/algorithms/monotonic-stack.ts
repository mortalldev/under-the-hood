import { parseNumbers } from "../core/parse";
import { recorder } from "../core/recorder";
import type { ParseResult } from "../core/types";

export const monotonicStackCode = `function nextGreater(nums: number[]): number[] {
  const res = new Array<number>(nums.length).fill(-1);
  const stack: number[] = [];   // indices; their values strictly decrease
  for (let i = 0; i < nums.length; i++) {
    while (stack.length && nums[stack[stack.length - 1]] < nums[i]) {
      res[stack.pop()!] = nums[i];  // i is the first greater to the right
    }
    stack.push(i);              // i waits for its own answer
  }
  return res;                   // still on the stack ⇒ no greater element
}`;

export interface MonotonicStackState {
  nums: number[];
  i: number | null;
  stack: number[];
  res: number[];
  popped: number | null;
}

export const parseMonotonicStack = (raw: string): ParseResult<number[]> => parseNumbers(raw, { min: 1, max: 14 });

export function monotonicStackSteps(nums: number[]) {
  const rec = recorder<MonotonicStackState>();
  const st: MonotonicStackState = { nums, i: null, stack: [], res: nums.map(() => -1), popped: null };
  rec.push(st, 2, `res starts as -1 everywhere ("no greater element"). The stack holds indices still waiting for an answer.`, `res hamma joyda -1 dan boshlanadi ("katta element yoʻq"). Stack hali javob kutayotgan indekslarni saqlaydi.`);

  for (let i = 0; i < nums.length; i++) {
    st.i = i;
    st.popped = null;
    rec.push(st, 4, `Read nums[${i}] = ${nums[i]}.`, `nums[${i}] = ${nums[i]} oʻqiladi.`);
    while (st.stack.length && nums[st.stack[st.stack.length - 1]] < nums[i]) {
      const j = st.stack.pop() as number;
      st.res[j] = nums[i];
      st.popped = j;
      rec.push(st, 6, `nums[${j}] = ${nums[j]} < ${nums[i]}: index ${j} finally has its answer ${nums[i]}. Pop it — it will never be needed again.`, `nums[${j}] = ${nums[j]} < ${nums[i]}: ${j}-indeks nihoyat javobini oldi — ${nums[i]}. Uni pop qilamiz — u boshqa hech qachon kerak boʻlmaydi.`);
    }
    st.popped = null;
    st.stack.push(i);
    rec.push(st, 8, `Push ${i}. The stack values stay decreasing from bottom to top — that is the monotonic invariant.`, `${i} push qilinadi. Stack qiymatlari pastdan yuqoriga kamayib boradi — bu monotonic invariant.`);
  }
  st.i = null;
  rec.push(st, 10, `Each index is pushed once and popped at most once → O(n) total, even though there is a nested while loop.`, `Har bir indeks bir marta push va koʻpi bilan bir marta pop qilinadi → ichma-ich while boʻlsa ham jami O(n).`);
  return rec.steps;
}

export function nextGreaterBrute(nums: number[]): number[] {
  return nums.map((x, i) => nums.slice(i + 1).find((y) => y > x) ?? -1);
}
