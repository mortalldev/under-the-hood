import { recorder } from "../core/recorder";
import { fail, ok, type ParseResult } from "../core/types";

export type Interval = [number, number];

export const mergeIntervalsCode = `function merge(intervals: [number, number][]): [number, number][] {
  intervals.sort((a, b) => a[0] - b[0]);   // by start: O(n log n)
  const out: [number, number][] = [];
  for (const [s, e] of intervals) {
    const last = out[out.length - 1];
    if (last && s <= last[1]) {
      last[1] = Math.max(last[1], e);      // overlap: extend the last one
    } else {
      out.push([s, e]);                    // gap: start a new interval
    }
  }
  return out;
}`;

export interface IntervalsState {
  sorted: Interval[];
  i: number | null;
  out: Interval[];
  overlap: boolean | null;
  max: number;
}

export function parseIntervals(raw: string): ParseResult<Interval[]> {
  const items = raw.split(",").map((s) => s.trim()).filter(Boolean);
  if (items.length < 1 || items.length > 10) return fail("Give 1–10 intervals like 1-3, 2-6.", "1-3, 2-6 kabi 1–10 ta interval kiriting.");
  const out: Interval[] = [];
  for (const item of items) {
    const m = /^(\d{1,2})\s*-\s*(\d{1,2})$/.exec(item);
    if (!m) return fail(`Cannot read "${item}". Use start-end with 0–99.`, `"${item}" oʻqib boʻlmadi. 0–99 oraligʻida start-end yozing.`);
    const s = Number(m[1]);
    const e = Number(m[2]);
    if (s > e) return fail(`In "${item}" start is after end.`, `"${item}" da start end'dan keyin.`);
    out.push([s, e]);
  }
  return ok(out);
}

export function mergeIntervalsSteps(intervals: Interval[]) {
  const rec = recorder<IntervalsState>();
  const sorted = [...intervals].sort((a, b) => a[0] - b[0]);
  const max = Math.max(...intervals.map((x) => x[1]), 1);
  const st: IntervalsState = { sorted, i: null, out: [], overlap: null, max };
  rec.push(st, 2, `Sort by start. After sorting, an interval can only overlap the most recent merged one — earlier merged intervals end before it starts.`, `Start boʻyicha saralaymiz. Saralangandan keyin interval faqat oxirgi birlashtirilgan interval bilan kesisha oladi — oldingilari u boshlanishidan oldin tugaydi.`);

  sorted.forEach(([s, e], i) => {
    st.i = i;
    const last = st.out[st.out.length - 1];
    if (last && s <= last[1]) {
      st.overlap = true;
      rec.push(st, 6, `[${s}, ${e}] starts at ${s} ≤ ${last[1]} (end of the last merged) → overlap.`, `[${s}, ${e}] ${s} da boshlanadi ≤ ${last[1]} (oxirgi birlashganning oxiri) → kesishish.`);
      last[1] = Math.max(last[1], e);
      rec.push(st, 7, `Extend to [${last[0]}, ${last[1]}]. Use max: a contained interval like [2, 3] inside [1, 9] must not shrink it.`, `[${last[0]}, ${last[1]}] gacha kengaytiramiz. max kerak: [1, 9] ichidagi [2, 3] kabi interval uni qisqartirmasligi kerak.`);
    } else {
      st.overlap = false;
      rec.push(st, 6, last ? `[${s}, ${e}] starts after ${last[1]} → gap.` : `First interval.`, last ? `[${s}, ${e}] ${last[1]} dan keyin boshlanadi → boʻshliq.` : `Birinchi interval.`);
      st.out.push([s, e]);
      rec.push(st, 9, `Start a new merged interval [${s}, ${e}].`, `Yangi birlashtirilgan interval [${s}, ${e}] boshlanadi.`);
    }
  });
  st.i = null;
  st.overlap = null;
  rec.push(st, 12, `Result: ${st.out.map((x) => `[${x[0]}, ${x[1]}]`).join(" ")}. Sorting dominates: O(n log n).`, `Natija: ${st.out.map((x) => `[${x[0]}, ${x[1]}]`).join(" ")}. Saralash ustun turadi: O(n log n).`);
  return rec.steps;
}

/** Reference: paint a boolean line and read back the runs (inclusive ends). */
export function mergeIntervalsReference(intervals: Interval[]): Interval[] {
  const sorted = [...intervals].sort((a, b) => a[0] - b[0]);
  const out: Interval[] = [];
  for (const [s, e] of sorted) {
    const merged = out.find((x) => s <= x[1] && e >= x[0]);
    if (merged) {
      merged[0] = Math.min(merged[0], s);
      merged[1] = Math.max(merged[1], e);
    } else out.push([s, e]);
  }
  return out;
}
