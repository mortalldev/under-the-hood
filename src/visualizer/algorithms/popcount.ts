import { parseInteger } from "../core/parse";
import { recorder } from "../core/recorder";
import type { ParseResult } from "../core/types";

export const popcountCode = `function popcount(x: number): number {
  let count = 0;
  while (x !== 0) {
    x &= x - 1;     // clears the lowest set bit
    count++;
  }
  return count;     // loops once per 1-bit, not once per bit
}`;

export interface PopcountState {
  bits: number;
  x: number;
  minusOne: number | null;
  count: number;
}

const BITS = 8;

export const parsePopcount = (raw: string): ParseResult<number> => parseInteger(raw, "x", 0, 255);

export function popcountSteps(start: number) {
  const rec = recorder<PopcountState>();
  const st: PopcountState = { bits: BITS, x: start, minusOne: null, count: 0 };
  rec.push(st, 2, `x = ${start}. Subtracting 1 flips the lowest 1-bit to 0 and every 0 below it to 1.`, `x = ${start}. 1 ni ayirish eng kichik 1-bitni 0 ga, undan pastdagi barcha 0 larni 1 ga aylantiradi.`);
  while (st.x !== 0) {
    st.minusOne = st.x - 1;
    rec.push(st, 4, `x − 1 = ${st.minusOne}. Compare the two rows: they agree above the lowest 1-bit and disagree from it down.`, `x − 1 = ${st.minusOne}. Ikki qatorni solishtiring: eng kichik 1-bitdan yuqorida ular bir xil, undan pastda farq qiladi.`);
    st.x &= st.minusOne;
    st.count++;
    st.minusOne = null;
    rec.push(st, 5, `x & (x − 1) = ${st.x}: exactly that bit is cleared. count = ${st.count}.`, `x & (x − 1) = ${st.x}: aynan oʻsha bit tozalandi. count = ${st.count}.`);
  }
  rec.push(st, 7, `popcount(${start}) = ${st.count}. Bonus: x > 0 && (x & (x − 1)) === 0 tests "power of two".`, `popcount(${start}) = ${st.count}. Bonus: x > 0 && (x & (x − 1)) === 0 — "ikkining darajasi" tekshiruvi.`);
  return rec.steps;
}
