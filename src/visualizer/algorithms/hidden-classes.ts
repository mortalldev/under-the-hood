import { recorder } from "../core/recorder";
import { fail, ok, type ParseResult } from "../core/types";

export const hiddenClassCode = `function Point(order) {         // conceptually:
  const p = {};                  // starts with the empty shape
  for (const k of order) p[k] = 0;  // each new key = shape transition
  return p;
}
function getX(p) { return p.x; } // inline cache keyed by shape

// Same keys, same order ⇒ same shape ⇒ monomorphic, fast
// Different order ⇒ different shapes ⇒ polymorphic (2–4) or megamorphic (> 4)`;

export interface HiddenClassInput {
  objects: { name: string; keys: string[] }[];
}

export interface ShapeNode {
  id: string;
  keys: string[];
  children: string[];
}

export interface HiddenClassState {
  shapes: ShapeNode[];
  objects: { name: string; shape: string }[];
  activeShape: string | null;
  created: string | null;
  icShapes: string[] | null;
}

export function parseHiddenClasses(raw: string): ParseResult<HiddenClassInput> {
  const items = raw.split(";").map((s) => s.trim()).filter(Boolean);
  if (items.length < 1 || items.length > 6) return fail("Give 1–6 objects like p1: x, y; p2: y, x", "p1: x, y; p2: y, x kabi 1–6 ta obyekt kiriting");
  const objects: HiddenClassInput["objects"] = [];
  for (const item of items) {
    const m = /^(\w{1,6})\s*:\s*(.+)$/.exec(item);
    if (!m) return fail(`Cannot read "${item}". Use name: key, key`, `"${item}" oʻqib boʻlmadi. nom: key, key koʻrinishida yozing`);
    const keys = m[2].split(",").map((k) => k.trim()).filter(Boolean);
    if (keys.length > 4 || keys.some((k) => !/^[a-z]\w{0,5}$/.test(k)) || new Set(keys).size !== keys.length) {
      return fail(`"${m[1]}": up to 4 distinct lowercase keys.`, `"${m[1]}": 4 tagacha takrorlanmas kichik harfli key.`);
    }
    objects.push({ name: m[1], keys });
  }
  return ok({ objects });
}

export function hiddenClassSteps({ objects }: HiddenClassInput) {
  const rec = recorder<HiddenClassState>();
  const st: HiddenClassState = { shapes: [{ id: "S0", keys: [], children: [] }], objects: [], activeShape: "S0", created: null, icShapes: null };
  let n = 1;
  rec.push(st, 2, `Every {} starts with the root shape S0 (no properties). A shape (V8: "map", "hidden class") records which keys exist and at which offset.`, `Har bir {} ildiz shape S0 (property'siz) bilan boshlanadi. Shape (V8 da "map", "hidden class") qaysi key'lar qaysi offset'da turishini yozib boradi.`);

  for (const obj of objects) {
    let shape = "S0";
    st.objects.push({ name: obj.name, shape });
    const o = st.objects[st.objects.length - 1];
    for (const key of obj.keys) {
      const cur = st.shapes.find((s) => s.id === shape) as ShapeNode;
      const existing = cur.children.map((c) => st.shapes.find((s) => s.id === c) as ShapeNode).find((s) => s.keys[s.keys.length - 1] === key);
      if (existing) {
        shape = existing.id;
        st.created = null;
        st.activeShape = shape;
        o.shape = shape;
        rec.push(st, 3, `${obj.name}.${key} = …: transition ${cur.id} → ${shape} already exists — reuse it. Objects built the same way share a shape.`, `${obj.name}.${key} = …: ${cur.id} → ${shape} oʻtishi allaqachon bor — qayta ishlatiladi. Bir xil tarzda qurilgan obyektlar bitta shape'ni boʻlishadi.`);
      } else {
        const id = `S${n++}`;
        st.shapes.push({ id, keys: [...cur.keys, key], children: [] });
        cur.children.push(id);
        shape = id;
        st.created = id;
        st.activeShape = id;
        o.shape = id;
        rec.push(st, 3, `${obj.name}.${key} = …: no transition for "${key}" from ${cur.id} — create shape ${id} {${[...cur.keys, key].join(", ")}}.`, `${obj.name}.${key} = …: ${cur.id} dan "${key}" uchun oʻtish yoʻq — ${id} {${[...cur.keys, key].join(", ")}} shape yaratiladi.`);
      }
    }
  }

  st.created = null;
  st.activeShape = null;
  const withX = st.objects.filter((o) => (st.shapes.find((s) => s.id === o.shape) as ShapeNode).keys.includes("x"));
  const distinct = [...new Set(withX.map((o) => o.shape))];
  st.icShapes = distinct;
  const kind = distinct.length <= 1 ? "monomorphic" : distinct.length <= 4 ? "polymorphic" : "megamorphic";
  rec.push(
    st,
    6,
    distinct.length === 0
      ? `No object has "x", so getX would always miss.`
      : `getX(p) called with ${withX.map((o) => o.name).join(", ")} sees ${distinct.length} shape(s): ${distinct.join(", ")} → ${kind} inline cache. Monomorphic: one shape check then a fixed-offset load. Polymorphic: a short list of checks. Megamorphic: falls back to a slower generic lookup. (Thresholds are V8 implementation details.)`,
    distinct.length === 0
      ? `Hech bir obyektda "x" yoʻq, shuning uchun getX doim topa olmaydi.`
      : `getX(p) ${withX.map((o) => o.name).join(", ")} bilan chaqirilganda ${distinct.length} ta shape koʻradi: ${distinct.join(", ")} → ${kind} inline cache. Monomorphic: bitta shape tekshiruvi va qat'iy offset'dan oʻqish. Polymorphic: qisqa tekshiruvlar roʻyxati. Megamorphic: sekinroq umumiy qidiruvga qaytadi. (Chegaralar V8 implementatsiya tafsiloti.)`,
  );
  return rec.steps;
}
