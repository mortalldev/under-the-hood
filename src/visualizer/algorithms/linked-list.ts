import { parseNumbers } from "../core/parse";
import { recorder } from "../core/recorder";
import type { ParseResult } from "../core/types";

export const reverseListCode = `function reverse(head: ListNode | null): ListNode | null {
  let prev: ListNode | null = null;
  let curr = head;
  while (curr) {
    const next = curr.next;  // 1. save the rest of the list
    curr.next = prev;        // 2. flip one pointer
    prev = curr;             // 3. advance prev
    curr = next;             // 4. advance curr
  }
  return prev;               // prev is the new head
}`;

export interface LinkedListState {
  values: number[];
  /** next[i] = index of the node that node i points to. */
  next: (number | null)[];
  prev: number | null;
  curr: number | null;
  nxt: number | null;
  head: number | null;
}

export const parseLinkedList = (raw: string): ParseResult<number[]> => parseNumbers(raw, { min: 1, max: 8, label: "list" });

export function reverseListSteps(values: number[]) {
  const rec = recorder<LinkedListState>();
  const st: LinkedListState = {
    values,
    next: values.map((_, i) => (i + 1 < values.length ? i + 1 : null)),
    prev: null,
    curr: 0,
    nxt: null,
    head: 0,
  };
  rec.push(st, 3, `prev = null, curr = head. Everything left of curr will be reversed; everything from curr on is untouched.`, `prev = null, curr = head. curr'dan chapdagi hamma narsa teskari boʻladi; curr'dan boshlab hech narsa oʻzgarmagan.`);

  while (st.curr !== null) {
    const c: number = st.curr;
    st.nxt = st.next[c];
    rec.push(st, 5, `Save next = ${st.nxt === null ? "null" : values[st.nxt]}. Without this, flipping curr.next would lose the rest of the list.`, `next = ${st.nxt === null ? "null" : values[st.nxt]} saqlanadi. Busiz curr.next ni oʻzgartirganda roʻyxatning qolgani yoʻqoladi.`);
    st.next[c] = st.prev;
    rec.push(st, 6, `Flip: ${values[c]}.next now points to ${st.prev === null ? "null" : values[st.prev]}.`, `Teskari: ${values[c]}.next endi ${st.prev === null ? "null" : values[st.prev]} ga koʻrsatadi.`);
    st.prev = c;
    st.curr = st.nxt;
    rec.push(st, 8, `Advance both pointers. Reversed part: ${values[c]}…; remaining: ${st.curr === null ? "none" : values[st.curr] + "…"}.`, `Ikkala pointer oldinga suriladi. Teskari qism: ${values[c]}…; qolgani: ${st.curr === null ? "yoʻq" : values[st.curr] + "…"}.`);
  }
  st.nxt = null;
  st.head = st.prev;
  rec.push(st, 10, `curr is null; prev is the new head. O(n) time, O(1) extra space — no new nodes were allocated.`, `curr null; prev — yangi head. O(n) vaqt, O(1) qoʻshimcha xotira — yangi node yaratilmadi.`);
  return rec.steps;
}

/** Walks `next` pointers from `head` and returns the values in order. */
export function readList(state: LinkedListState): number[] {
  const out: number[] = [];
  let i = state.head;
  while (i !== null && out.length <= state.values.length) {
    out.push(state.values[i]);
    i = state.next[i];
  }
  return out;
}
