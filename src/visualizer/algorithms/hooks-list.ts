import { splitParts } from "../core/parse";
import { recorder } from "../core/recorder";
import { fail, ok, type ParseResult } from "../core/types";

export const hooksCode = `function Profile({ showBio }) {
  const [name, setName] = useState("Ada");   // hook #0
  if (showBio) {
    useEffect(() => { /* … */ });            // hook #1 — only sometimes!
  }
  const ref = useRef(null);                  // hook #1 or #2?
  // React finds each hook's state by CALL ORDER, not by name:
  // fiber.memoizedState → hook0 → hook1 → hook2 → null
}`;

const KNOWN = ["useState", "useEffect", "useRef", "useMemo", "useCallback", "useContext", "useReducer", "useLayoutEffect"] as const;
type HookName = (typeof KNOWN)[number];

export interface HooksInput {
  first: HookName[];
  second: HookName[];
}

export interface HooksState {
  list: { type: HookName; value: string }[];
  render: 1 | 2;
  cursor: number | null;
  calls: HookName[];
  error: string | null;
  mismatchAt: number | null;
}

export function parseHooks(raw: string): ParseResult<HooksInput> {
  const parts = splitParts(raw, 2);
  if (!parts.ok) return parts;
  const lists = parts.value.map((p) => p.split(/[\s,]+/).filter(Boolean));
  for (const list of lists) {
    if (list.length < 1 || list.length > 6) return fail("Each render: 1–6 hook calls.", "Har bir render: 1–6 ta hook chaqiruvi.");
    const bad = list.find((h) => !(KNOWN as readonly string[]).includes(h));
    if (bad) return fail(`Unknown hook "${bad}". Use: ${KNOWN.join(", ")}.`, `Nomaʼlum hook "${bad}". Ishlating: ${KNOWN.join(", ")}.`);
  }
  return ok({ first: lists[0] as HookName[], second: lists[1] as HookName[] });
}

const initial: Record<HookName, string> = {
  useState: '"Ada"',
  useEffect: "effect",
  useRef: "{ current: null }",
  useMemo: "[value, deps]",
  useCallback: "[fn, deps]",
  useContext: "(reads context, no slot)",
  useReducer: "state",
  useLayoutEffect: "effect",
};

export function hooksSteps({ first, second }: HooksInput) {
  const rec = recorder<HooksState>();
  const st: HooksState = { list: [], render: 1, cursor: null, calls: [], error: null, mismatchAt: null };
  rec.push(st, 1, `First render (mount). The fiber has an empty hook list.`, `Birinchi render (mount). Fiber'ning hook roʻyxati boʻsh.`);
  first.forEach((h, i) => {
    st.calls.push(h);
    st.cursor = i;
    if (h === "useContext") {
      rec.push(st, 2, `Call #${i}: useContext reads the nearest Provider's value. In current React it does not occupy a hook slot, but calling it conditionally is still against the Rules of Hooks.`, `#${i} chaqiruv: useContext eng yaqin Provider qiymatini oʻqiydi. Hozirgi React'da u hook slotini egallamaydi, lekin uni shartli chaqirish baribir Rules of Hooks'ga zid.`);
      return;
    }
    st.list.push({ type: h, value: initial[h] });
    rec.push(st, 2, `Call #${i}: ${h} on mount appends a new hook object to the list (slot ${st.list.length - 1}) and stores ${initial[h]}.`, `#${i} chaqiruv: mount paytida ${h} roʻyxatga yangi hook object qoʻshadi (${st.list.length - 1}-slot) va ${initial[h]} ni saqlaydi.`);
  });

  st.render = 2;
  st.cursor = null;
  st.calls = [];
  rec.push(st, 6, `Second render (update). React walks the SAME list from the start; each hook call takes the next slot.`, `Ikkinchi render (update). React OʻSHA roʻyxatni boshidan aylanadi; har bir hook chaqiruvi keyingi slotni oladi.`);
  let slot = 0;
  for (let i = 0; i < second.length; i++) {
    const h = second[i];
    st.calls.push(h);
    if (h === "useContext") {
      rec.push(st, 6, `Call #${i}: useContext — no slot consumed.`, `#${i} chaqiruv: useContext — slot sarflanmaydi.`);
      continue;
    }
    st.cursor = slot;
    const stored = st.list[slot];
    if (!stored) {
      st.error = "Rendered more hooks than during the previous render.";
      st.mismatchAt = slot;
      rec.push(st, 6, `Call #${i}: ${h} asks for slot ${slot}, but the list ended. React throws "${st.error}"`, `#${i} chaqiruv: ${h} ${slot}-slotni soʻraydi, lekin roʻyxat tugagan. React xato tashlaydi: "${st.error}"`);
      return rec.steps;
    }
    if (stored.type !== h) {
      st.error = `${h} received the state of a ${stored.type}.`;
      st.mismatchAt = slot;
      rec.push(st, 6, `Call #${i}: ${h} reads slot ${slot}, which holds a ${stored.type} (${stored.value}). Every later hook is now shifted by one. In development React logs "React has detected a change in the order of Hooks"; in production you get wrong state or a crash.`, `#${i} chaqiruv: ${h} ${slot}-slotni oʻqiydi, unda esa ${stored.type} (${stored.value}) turibdi. Keyingi barcha hook'lar endi bittaga siljigan. Development'da React "React has detected a change in the order of Hooks" deb yozadi; production'da notoʻgʻri state yoki crash olasiz.`);
      return rec.steps;
    }
    rec.push(st, 6, `Call #${i}: ${h} reads slot ${slot} → ${stored.value}. Types match.`, `#${i} chaqiruv: ${h} ${slot}-slotni oʻqiydi → ${stored.value}. Turlar mos.`);
    slot++;
  }
  if (slot < st.list.length) {
    st.error = "Rendered fewer hooks than expected.";
    st.mismatchAt = slot;
    rec.push(st, 6, `The component returned but slots ${slot}…${st.list.length - 1} were never read. React throws "${st.error} This may be caused by an accidental early return statement."`, `Komponent qaytdi, lekin ${slot}…${st.list.length - 1} slotlar oʻqilmadi. React xato tashlaydi: "${st.error} This may be caused by an accidental early return statement."`);
    return rec.steps;
  }
  st.cursor = null;
  rec.push(st, 7, `Same hooks in the same order → every call found its own state. This is why hooks must be called unconditionally at the top level.`, `Bir xil hook'lar bir xil tartibda → har bir chaqiruv oʻz state'ini topdi. Shuning uchun hook'lar shartsiz, yuqori darajada chaqirilishi shart.`);
  return rec.steps;
}
