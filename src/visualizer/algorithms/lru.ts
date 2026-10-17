import { parseInteger, splitParts } from "../core/parse";
import { recorder } from "../core/recorder";
import { fail, ok, type ParseResult } from "../core/types";

export const lruCode = `class LRUCache<K, V> {
  private map = new Map<K, V>();          // Map iterates in insertion order
  constructor(private capacity: number) {}
  get(key: K): V | undefined {
    if (!this.map.has(key)) return undefined;        // miss
    const value = this.map.get(key)!;
    this.map.delete(key); this.map.set(key, value);  // move to most-recent end
    return value;
  }
  put(key: K, value: V) {
    this.map.delete(key);
    this.map.set(key, value);
    if (this.map.size > this.capacity) {
      this.map.delete(this.map.keys().next().value!); // evict least recent
    }
  }
}`;

export type LruOp = { op: "get"; key: string } | { op: "put"; key: string; value: string };

export interface LruInput {
  capacity: number;
  ops: LruOp[];
}

export interface LruState {
  capacity: number;
  /** Least recent first. */
  entries: [string, string][];
  op: string | null;
  hit: boolean | null;
  evicted: string | null;
  touched: string | null;
  hits: number;
  misses: number;
}

export function parseLru(raw: string): ParseResult<LruInput> {
  const parts = splitParts(raw, 2);
  if (!parts.ok) return parts;
  const cap = parseInteger(parts.value[0], "capacity", 1, 6);
  if (!cap.ok) return cap;
  const ops: LruOp[] = [];
  for (const item of parts.value[1].split(",").map((s) => s.trim()).filter(Boolean)) {
    const g = /^get\s+(\w{1,4})$/.exec(item);
    const p = /^put\s+(\w{1,4})\s+(\w{1,4})$/.exec(item);
    if (g) ops.push({ op: "get", key: g[1] });
    else if (p) ops.push({ op: "put", key: p[1], value: p[2] });
    else return fail(`Cannot read "${item}". Use "get a" or "put a 1".`, `"${item}" oʻqib boʻlmadi. "get a" yoki "put a 1" yozing.`);
  }
  if (ops.length < 1 || ops.length > 14) return fail("1–14 operations.", "1–14 ta amal.");
  return ok({ capacity: cap.value, ops });
}

export function lruSteps({ capacity, ops }: LruInput) {
  const rec = recorder<LruState>();
  const map = new Map<string, string>();
  const st: LruState = { capacity, entries: [], op: null, hit: null, evicted: null, touched: null, hits: 0, misses: 0 };
  const sync = () => {
    st.entries = [...map.entries()];
  };
  rec.push(st, 2, `Capacity ${capacity}. Left = least recently used (next to evict), right = most recent. Both get and put are O(1).`, `Sigʻim ${capacity}. Chap = eng uzoq ishlatilmagan (birinchi chiqariladi), oʻng = eng soʻnggi. get ham, put ham O(1).`);
  for (const o of ops) {
    st.evicted = null;
    st.touched = o.key;
    if (o.op === "get") {
      st.op = `get ${o.key}`;
      if (!map.has(o.key)) {
        st.hit = false;
        st.misses++;
        sync();
        rec.push(st, 5, `get ${o.key}: miss — the caller must fetch from the slow source (DB) and usually put it here.`, `get ${o.key}: miss — chaqiruvchi sekin manbadan (DB) olishi va odatda bu yerga put qilishi kerak.`);
        continue;
      }
      const v = map.get(o.key) as string;
      map.delete(o.key);
      map.set(o.key, v);
      st.hit = true;
      st.hits++;
      sync();
      rec.push(st, 7, `get ${o.key}: hit → ${v}. Move it to the most-recent end; reading counts as use.`, `get ${o.key}: hit → ${v}. Eng soʻnggi tomonga koʻchiriladi; oʻqish ham ishlatish hisoblanadi.`);
    } else {
      st.op = `put ${o.key} ${o.value}`;
      st.hit = null;
      map.delete(o.key);
      map.set(o.key, o.value);
      if (map.size > capacity) {
        const victim = map.keys().next().value as string;
        map.delete(victim);
        st.evicted = victim;
      }
      sync();
      rec.push(st, st.evicted ? 14 : 12, st.evicted ? `put ${o.key}: over capacity → evict least recent "${st.evicted}".` : `put ${o.key} = ${o.value} at the most-recent end.`, st.evicted ? `put ${o.key}: sigʻimdan oshdi → eng uzoq ishlatilmagan "${st.evicted}" chiqariladi.` : `put ${o.key} = ${o.value} eng soʻnggi tomonga.`);
    }
  }
  st.op = null;
  st.touched = null;
  st.hit = null;
  rec.push(st, 17, `Hits ${st.hits}, misses ${st.misses}. The classic interview version uses a hash map + doubly linked list; JS's ordered Map gives the same O(1) behaviour.`, `Hit ${st.hits}, miss ${st.misses}. Klassik interview varianti hash map + doubly linked list ishlatadi; JS'ning tartiblangan Map'i xuddi shu O(1) xatti-harakatni beradi.`);
  return rec.steps;
}
