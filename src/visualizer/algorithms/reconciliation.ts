import { splitParts } from "../core/parse";
import { recorder } from "../core/recorder";
import { fail, ok, type ParseResult } from "../core/types";

export type KeyMode = "keyed" | "index";

export const reconcileCode = `// Simplified from React's reconcileChildrenArray
let lastPlacedIndex = 0;
const oldByKey = new Map(oldFibers.map((f) => [f.key, f]));
for (const child of newChildren) {
  const old = oldByKey.get(child.key);
  if (!old) { insert(child); continue; }           // new key → mount
  oldByKey.delete(child.key);
  update(old, child);                               // same key → reuse fiber + state
  if (old.index < lastPlacedIndex) move(old);       // it was left of something we kept
  else lastPlacedIndex = old.index;                 // stays; becomes the new anchor
}
oldByKey.forEach(remove);                           // leftovers → unmount`;

export const indexCode = `// key={index} (or no key): identity = position
for (let i = 0; i < Math.max(oldList.length, newList.length); i++) {
  if (i >= oldList.length) insert(newList[i]);
  else if (i >= newList.length) remove(oldList[i]);
  else update(oldList[i], newList[i]);   // same fiber + SAME STATE, new props
}`;

export interface ReconcileInput {
  before: string[];
  after: string[];
}

export type OpKind = "keep" | "update" | "move" | "insert" | "remove";

export interface ReconcileState {
  before: string[];
  after: string[];
  i: number | null;
  lastPlacedIndex: number;
  ops: { kind: OpKind; text: string }[];
  /** Per new position: what happened. */
  newTones: (OpKind | null)[];
  /** Per old position. */
  oldTones: (OpKind | null)[];
  /** For index mode: which old item's state ended up at each new position. */
  stateFrom: (string | null)[];
}

export function parseReconcile(raw: string): ParseResult<ReconcileInput> {
  const parts = splitParts(raw, 2);
  if (!parts.ok) return parts;
  const lists = parts.value.map((p) => p.split(/[\s,]+/).filter(Boolean));
  for (const list of lists) {
    if (list.length > 8) return fail("At most 8 items per list.", "Har bir roʻyxatda koʻpi bilan 8 ta element.");
    if (list.some((x) => !/^\w{1,3}$/.test(x))) return fail("Items: 1–3 letters/digits.", "Elementlar: 1–3 harf/raqam.");
    if (new Set(list).size !== list.length) return fail("Keys must be unique within a list.", "Key'lar roʻyxat ichida takrorlanmasligi kerak.");
  }
  return ok({ before: lists[0], after: lists[1] });
}

export function reconcileSteps({ before, after }: ReconcileInput, mode: KeyMode) {
  const rec = recorder<ReconcileState>();
  const st: ReconcileState = {
    before,
    after,
    i: null,
    lastPlacedIndex: 0,
    ops: [],
    newTones: after.map(() => null),
    oldTones: before.map(() => null),
    stateFrom: after.map(() => null),
  };

  if (mode === "index") {
    rec.push(st, 2, `With index keys, React matches children purely by position. Imagine each item is an <input> with typed text (state).`, `Index key'lar bilan React bolalarni faqat pozitsiya boʻyicha moslashtiradi. Har bir element ichiga matn yozilgan <input> (state) deb tasavvur qiling.`);
    const n = Math.max(before.length, after.length);
    for (let i = 0; i < n; i++) {
      st.i = i;
      if (i >= before.length) {
        st.newTones[i] = "insert";
        st.ops.push({ kind: "insert", text: `insert ${after[i]}` });
        rec.push(st, 3, `Position ${i} is new → mount ${after[i]} with fresh state.`, `${i}-pozitsiya yangi → ${after[i]} yangi state bilan mount qilinadi.`);
      } else if (i >= after.length) {
        st.oldTones[i] = "remove";
        st.ops.push({ kind: "remove", text: `remove ${before[i]}` });
        rec.push(st, 4, `Position ${i} disappeared → unmount — this destroys the state that belonged to whatever was LAST, not necessarily the item you deleted.`, `${i}-pozitsiya yoʻqoldi → unmount — bu siz oʻchirgan element emas, OXIRGI turgan elementning state'ini yoʻq qiladi.`);
      } else {
        st.stateFrom[i] = before[i];
        if (before[i] === after[i]) {
          st.newTones[i] = "keep";
          st.oldTones[i] = "keep";
          rec.push(st, 5, `Position ${i}: ${after[i]} → ${after[i]}, nothing changed.`, `${i}-pozitsiya: ${after[i]} → ${after[i]}, hech narsa oʻzgarmadi.`);
        } else {
          st.newTones[i] = "update";
          st.oldTones[i] = "update";
          st.ops.push({ kind: "update", text: `update #${i}: ${before[i]}→${after[i]}` });
          rec.push(st, 5, `Position ${i}: same component type, so React reuses the fiber and only changes props ${before[i]} → ${after[i]}. The STATE of ${before[i]} stays here — now displayed next to ${after[i]}'s label. That is the classic index-key bug.`, `${i}-pozitsiya: komponent turi bir xil, shuning uchun React fiber'ni qayta ishlatib, faqat props'ni oʻzgartiradi ${before[i]} → ${after[i]}. ${before[i]} ning STATE'i shu yerda qoladi — endi ${after[i]} yorligʻi yonida koʻrinadi. Bu index-key'ning klassik bug'i.`);
        }
      }
    }
    st.i = null;
    rec.push(st, 6, `${st.ops.length} DOM operation(s). Index keys are only safe when the list is never reordered, filtered or prepended and items have no state.`, `${st.ops.length} ta DOM amali. Index key'lar faqat roʻyxat hech qachon qayta tartiblanmasa, filtrlanmasa, boshiga qoʻshilmasa va elementlarda state boʻlmasa xavfsiz.`);
    return rec.steps;
  }

  const oldIndex = new Map(before.map((k, i) => [k, i]));
  rec.push(st, 3, `Keyed: build a map key → old fiber. lastPlacedIndex = 0 tracks the rightmost old position we decided to keep in place.`, `Keyed: key → eski fiber map'i quriladi. lastPlacedIndex = 0 joyida qoldirishga qaror qilingan eng oʻngdagi eski pozitsiyani kuzatadi.`);
  after.forEach((key, i) => {
    st.i = i;
    const oi = oldIndex.get(key);
    if (oi === undefined) {
      st.newTones[i] = "insert";
      st.ops.push({ kind: "insert", text: `insert ${key}` });
      rec.push(st, 6, `${key} is a new key → mount a new fiber (new state).`, `${key} yangi key → yangi fiber mount qilinadi (yangi state).`);
      return;
    }
    oldIndex.delete(key);
    st.stateFrom[i] = key;
    if (oi < st.lastPlacedIndex) {
      st.newTones[i] = "move";
      st.oldTones[oi] = "move";
      st.ops.push({ kind: "move", text: `move ${key}` });
      rec.push(st, 9, `${key} was at old index ${oi} < lastPlacedIndex ${st.lastPlacedIndex}: it used to be LEFT of an item we kept, now it must be right of it → move the DOM node. State is preserved.`, `${key} eski ${oi}-indeksda edi < lastPlacedIndex ${st.lastPlacedIndex}: u saqlangan elementdan CHAPDA edi, endi oʻngida boʻlishi kerak → DOM node koʻchiriladi. State saqlanadi.`);
    } else {
      st.lastPlacedIndex = oi;
      st.newTones[i] = "keep";
      st.oldTones[oi] = "keep";
      rec.push(st, 10, `${key} was at old index ${oi} ≥ lastPlacedIndex: it can stay where it is. lastPlacedIndex = ${oi}.`, `${key} eski ${oi}-indeksda edi ≥ lastPlacedIndex: joyida qolishi mumkin. lastPlacedIndex = ${oi}.`);
    }
  });
  st.i = null;
  for (const [key, oi] of oldIndex) {
    st.oldTones[oi] = "remove";
    st.ops.push({ kind: "remove", text: `remove ${key}` });
    rec.push(st, 12, `${key} is not in the new list → unmount it (its state is gone).`, `${key} yangi roʻyxatda yoʻq → unmount qilinadi (state'i yoʻqoladi).`);
  }
  const moves = st.ops.filter((o) => o.kind === "move").length;
  rec.push(st, 12, `${st.ops.length} DOM operation(s), ${moves} move(s). Note the asymmetry: moving the LAST item to the front moves every other item, because the algorithm only scans left-to-right.`, `${st.ops.length} ta DOM amali, ${moves} ta koʻchirish. Asimmetriyaga e'tibor bering: OXIRGI elementni boshiga olish qolgan barcha elementlarni koʻchiradi, chunki algoritm faqat chapdan oʻngga skanerlaydi.`);
  return rec.steps;
}
