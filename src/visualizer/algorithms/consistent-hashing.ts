import { splitParts } from "../core/parse";
import { recorder } from "../core/recorder";
import { fail, ok, type ParseResult } from "../core/types";

export const consistentHashingCode = `// Ring of size 2^32 (shown as 0–359°). FNV-1a is fine for a demo; use a
// well-distributed hash (e.g. murmur/xxhash) in production.
function nodeFor(key: string, ring: { pos: number; node: string }[]) {
  const h = hash(key);
  const owner = ring.find((p) => p.pos >= h) ?? ring[0];  // first clockwise
  return owner.node;                                      // (binary search in practice)
}
// Adding a node only takes keys between it and its predecessor.
// Modulo hashing (hash(key) % N) remaps ~ (N-1)/N of all keys instead.`;

export interface ConsistentHashingInput {
  nodes: string[];
  keys: string[];
  added: string;
}

export interface RingPoint {
  pos: number;
  node: string;
}

export interface ConsistentHashingState {
  ring: RingPoint[];
  keys: { key: string; pos: number; owner: string | null; moved: boolean }[];
  current: string | null;
  added: string | null;
  moduloMoved: number | null;
}

/** FNV-1a, 32-bit. */
function fnv1a(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h;
}

const hashDeg = (s: string) => fnv1a(s) % 360;

export function parseConsistentHashing(raw: string): ParseResult<ConsistentHashingInput> {
  const parts = splitParts(raw, 3);
  if (!parts.ok) return parts;
  const list = (s: string) => s.split(/[\s,]+/).filter(Boolean);
  const nodes = list(parts.value[0]);
  const keys = list(parts.value[1]);
  const added = parts.value[2];
  if (nodes.length < 2 || nodes.length > 5) return fail("2–5 nodes.", "2–5 ta node.");
  if (keys.length < 1 || keys.length > 12) return fail("1–12 keys.", "1–12 ta key.");
  if (nodes.includes(added)) return fail("The added node must be new.", "Qoʻshiladigan node yangi boʻlishi kerak.");
  if ([...nodes, ...keys, added].some((x) => x.length > 10)) return fail("Names up to 10 characters.", "Nomlar 10 belgigacha.");
  return ok({ nodes, keys, added });
}

const ownerOf = (pos: number, ring: RingPoint[]) => (ring.find((p) => p.pos >= pos) ?? ring[0]).node;

export function consistentHashingSteps({ nodes, keys, added }: ConsistentHashingInput) {
  const rec = recorder<ConsistentHashingState>();
  const ring = nodes.map((n) => ({ pos: hashDeg(n), node: n })).sort((a, b) => a.pos - b.pos);
  const st: ConsistentHashingState = {
    ring,
    keys: keys.map((k) => ({ key: k, pos: hashDeg(k), owner: null, moved: false })),
    current: null,
    added: null,
    moduloMoved: null,
  };
  rec.push(st, 3, `Hash each node onto the ring: ${ring.map((p) => `${p.node}@${p.pos}°`).join(", ")}.`, `Har bir node halqaga hash qilinadi: ${ring.map((p) => `${p.node}@${p.pos}°`).join(", ")}.`);
  for (const k of st.keys) {
    k.owner = ownerOf(k.pos, st.ring);
    st.current = k.key;
    rec.push(st, 5, `"${k.key}" hashes to ${k.pos}°; walk clockwise to the first node → ${k.owner}.`, `"${k.key}" ${k.pos}° ga hash boʻladi; soat yoʻnalishi boʻyicha birinchi node'gacha yuramiz → ${k.owner}.`);
  }
  st.current = null;
  const newRing = [...st.ring, { pos: hashDeg(added), node: added }].sort((a, b) => a.pos - b.pos);
  st.ring = newRing;
  st.added = added;
  rec.push(st, 8, `Add node ${added} at ${hashDeg(added)}°.`, `${added} node'i ${hashDeg(added)}° ga qoʻshiladi.`);
  for (const k of st.keys) {
    const owner = ownerOf(k.pos, st.ring);
    k.moved = owner !== k.owner;
    k.owner = owner;
  }
  const moved = st.keys.filter((k) => k.moved).length;
  const mod = (s: string, n: number) => fnv1a(s) % n;
  st.moduloMoved = keys.filter((k) => mod(k, nodes.length) !== mod(k, nodes.length + 1)).length;
  rec.push(st, 9, `Only ${moved}/${keys.length} key(s) moved — exactly those in the arc ${added} took over. With hash % N, going from ${nodes.length} to ${nodes.length + 1} nodes would move ${st.moduloMoved}/${keys.length} here. Real systems add many virtual nodes per server to even out arc sizes.`, `Faqat ${keys.length} tadan ${moved} ta key koʻchdi — aynan ${added} egallagan yoydagilar. hash % N bilan ${nodes.length} dan ${nodes.length + 1} node'ga oʻtishda bu yerda ${keys.length} tadan ${st.moduloMoved} tasi koʻchardi. Haqiqiy tizimlar yoy oʻlchamlarini tenglashtirish uchun har bir serverga koʻp virtual node qoʻshadi.`);
  return rec.steps;
}
