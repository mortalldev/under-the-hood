import { parseInteger } from "../core/parse";
import { recorder } from "../core/recorder";
import type { ParseResult } from "../core/types";

export const dynamicArrayCode = `class DynamicArray {
  private data = new Array<number>(1);
  private size = 0;
  push(x: number) {
    if (this.size === this.data.length) {
      const bigger = new Array<number>(this.data.length * 2); // grow ×2
      for (let i = 0; i < this.size; i++) bigger[i] = this.data[i]; // O(size) copy
      this.data = bigger;
    }
    this.data[this.size++] = x;       // O(1) write
  }
}`;

export interface DynamicArrayState {
  slots: (number | null)[];
  size: number;
  lastCost: number;
  totalCost: number;
  pushes: number;
  resized: boolean;
}

export const parseDynamicArray = (raw: string): ParseResult<number> => parseInteger(raw, "n", 1, 17);

export function dynamicArraySteps(n: number) {
  const rec = recorder<DynamicArrayState>();
  const st: DynamicArrayState = { slots: [null], size: 0, lastCost: 0, totalCost: 0, pushes: 0, resized: false };
  rec.push(st, 2, `Capacity 1, size 0. "Cost" counts element writes, including copies.`, `Sigʻim 1, size 0. "Cost" — element yozishlar soni, nusxalashlar ham hisobga olinadi.`);
  for (let k = 1; k <= n; k++) {
    let cost = 1;
    st.resized = false;
    if (st.size === st.slots.length) {
      const bigger: (number | null)[] = new Array(st.slots.length * 2).fill(null);
      for (let i = 0; i < st.size; i++) bigger[i] = st.slots[i];
      cost += st.size;
      st.slots = bigger;
      st.resized = true;
      rec.push(st, 7, `Full! Allocate capacity ${bigger.length} and copy ${st.size} elements.`, `Toʻldi! ${bigger.length} sigʻimli joy ajratilib, ${st.size} ta element nusxalanadi.`);
    }
    st.slots[st.size++] = k;
    st.pushes = k;
    st.lastCost = cost;
    st.totalCost += cost;
    rec.push(st, 10, `push(${k}) cost ${cost}. Total ${st.totalCost} for ${k} pushes → average ${(st.totalCost / k).toFixed(2)} (always < 3).`, `push(${k}) narxi ${cost}. ${k} ta push uchun jami ${st.totalCost} → oʻrtacha ${(st.totalCost / k).toFixed(2)} (doim < 3).`);
  }
  rec.push(st, 10, `Copies form 1 + 2 + 4 + … < 2n, so n pushes cost < 3n writes: O(1) amortized per push even though a single push can be O(n).`, `Nusxalar 1 + 2 + 4 + … < 2n ni tashkil etadi, demak n ta push < 3n yozishga tushadi: bitta push O(n) boʻlishi mumkin boʻlsa ham, har biri amortized O(1).`);
  return rec.steps;
}
