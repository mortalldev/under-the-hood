import { recorder } from "../core/recorder";
import { fail, ok, type ParseResult } from "../core/types";

export const slidingWindowCode = `function longestUnique(s: string): number {
  const last = new Map<string, number>();
  let left = 0, best = 0;
  for (let right = 0; right < s.length; right++) {
    const prev = last.get(s[right]);
    if (prev !== undefined && prev >= left) {
      left = prev + 1;      // shrink past the duplicate
    }
    last.set(s[right], right);
    best = Math.max(best, right - left + 1);
  }
  return best;
}`;

export interface SlidingWindowState {
  chars: string[];
  left: number;
  right: number | null;
  last: [string, number][];
  best: number;
  bestFrom: number;
  dup: number | null;
  done: boolean;
}

export function parseSlidingWindow(raw: string): ParseResult<string> {
  const s = raw.trim();
  if (s.length < 1 || s.length > 18) return fail("Enter 1–18 characters.", "1–18 ta belgi kiriting.");
  if (/\s/.test(s)) return fail("No spaces, please.", "Boʻsh joysiz kiriting.");
  return ok(s);
}

export function slidingWindowSteps(s: string) {
  const rec = recorder<SlidingWindowState>();
  const last = new Map<string, number>();
  const st: SlidingWindowState = {
    chars: [...s],
    left: 0,
    right: null,
    last: [],
    best: 0,
    bestFrom: 0,
    dup: null,
    done: false,
  };
  const sync = () => {
    st.last = [...last.entries()];
  };

  rec.push(st, 3, "Empty window: left = 0, best = 0. The window [left, right] will always contain unique characters — that is the invariant.", "Boʻsh window: left = 0, best = 0. [left, right] window doim takrorlanmas belgilarni saqlaydi — bu invariant.");

  for (let right = 0; right < st.chars.length; right++) {
    const c = st.chars[right];
    st.right = right;
    st.dup = null;
    const prev = last.get(c);
    rec.push(st, 5, `Expand: right = ${right} reads '${c}'. Last seen at ${prev ?? "—"}.`, `Kengaytirish: right = ${right} '${c}' ni oʻqiydi. Oxirgi marta ${prev ?? "—"} da koʻrilgan.`);

    if (prev !== undefined && prev >= st.left) {
      st.dup = prev;
      rec.push(st, 6, `'${c}' was seen at ${prev}, which is inside the window [${st.left}, ${right}]. The invariant is broken.`, `'${c}' ${prev} da koʻrilgan, bu [${st.left}, ${right}] window ichida. Invariant buzildi.`);
      st.left = prev + 1;
      rec.push(st, 7, `Jump left to ${prev} + 1 = ${st.left}. No index between the old left and ${prev} can start a valid window that includes right, so skipping them is safe.`, `left ni ${prev} + 1 = ${st.left} ga sakratamiz. Eski left va ${prev} orasidagi hech bir indeks right'ni oʻz ichiga olgan toʻgʻri window boshlay olmaydi, shuning uchun ularni oʻtkazib yuborish xavfsiz.`);
    } else if (prev !== undefined) {
      rec.push(st, 6, `'${c}' was seen at ${prev}, but that is left of the window (left = ${st.left}) — stale, ignore it.`, `'${c}' ${prev} da koʻrilgan, lekin bu window'dan chapda (left = ${st.left}) — eskirgan, e'tibor bermaymiz.`);
    }

    last.set(c, right);
    sync();
    st.dup = null;
    const len = right - st.left + 1;
    if (len > st.best) {
      st.best = len;
      st.bestFrom = st.left;
      rec.push(st, 10, `Record last['${c}'] = ${right}. Window length ${len} is a new best.`, `last['${c}'] = ${right} yoziladi. Window uzunligi ${len} — yangi eng yaxshi natija.`);
    } else {
      rec.push(st, 10, `Record last['${c}'] = ${right}. Window length ${len} does not beat best = ${st.best}.`, `last['${c}'] = ${right} yoziladi. Window uzunligi ${len} best = ${st.best} dan oshmaydi.`);
    }
  }

  st.done = true;
  st.right = null;
  rec.push(st, 12, `Done: each index entered the window once and left at most once, so the whole scan is O(n). Answer: ${st.best}.`, `Tugadi: har bir indeks window'ga bir marta kirdi va koʻpi bilan bir marta chiqdi, shuning uchun butun skan O(n). Javob: ${st.best}.`);
  return rec.steps;
}

/** Brute-force reference used by tests. */
export function longestUniqueBrute(s: string): number {
  let best = 0;
  for (let i = 0; i < s.length; i++) {
    for (let j = i; j < s.length; j++) {
      const sub = s.slice(i, j + 1);
      if (new Set(sub).size === sub.length) best = Math.max(best, sub.length);
    }
  }
  return best;
}
