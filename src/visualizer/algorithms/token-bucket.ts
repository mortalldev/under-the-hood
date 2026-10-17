import { splitParts } from "../core/parse";
import { recorder } from "../core/recorder";
import { fail, ok, type ParseResult } from "../core/types";

export const tokenBucketCode = `class TokenBucket {
  private tokens: number;
  private last: number;
  constructor(private capacity: number, private ratePerSec: number) {
    this.tokens = capacity;                 // start full: allows an initial burst
    this.last = 0;
  }
  allow(now: number): boolean {
    const elapsed = now - this.last;
    this.tokens = Math.min(this.capacity, this.tokens + elapsed * this.ratePerSec); // lazy refill
    this.last = now;
    if (this.tokens >= 1) { this.tokens -= 1; return true; }
    return false;                           // → HTTP 429 + Retry-After
  }
}`;

export interface TokenBucketInput {
  capacity: number;
  rate: number;
  times: number[];
}

export interface TokenBucketState {
  capacity: number;
  tokens: number;
  now: number;
  results: { t: number; ok: boolean }[];
  current: number | null;
}

export function parseTokenBucket(raw: string): ParseResult<TokenBucketInput> {
  const parts = splitParts(raw, 3);
  if (!parts.ok) return parts;
  const capacity = Number(parts.value[0]);
  const rate = Number(parts.value[1]);
  const times = parts.value[2].split(/[\s,]+/).filter(Boolean).map(Number);
  if (!Number.isInteger(capacity) || capacity < 1 || capacity > 10) return fail("Capacity: integer 1–10.", "Capacity: 1–10 butun son.");
  if (!(rate > 0 && rate <= 10)) return fail("Rate: 0–10 tokens per second.", "Rate: soniyasiga 0–10 token.");
  if (times.length < 1 || times.length > 16 || times.some((t) => !Number.isFinite(t) || t < 0 || t > 60)) return fail("Times: 1–16 numbers between 0 and 60 seconds.", "Vaqtlar: 0 va 60 soniya orasida 1–16 ta son.");
  if (times.some((t, i) => i > 0 && t < times[i - 1])) return fail("Times must be non-decreasing.", "Vaqtlar kamaymaydigan boʻlishi kerak.");
  return ok({ capacity, rate, times });
}

const r2 = (x: number) => Math.round(x * 100) / 100;

export function tokenBucketSteps({ capacity, rate, times }: TokenBucketInput) {
  const rec = recorder<TokenBucketState>();
  const st: TokenBucketState = { capacity, tokens: capacity, now: 0, results: [], current: null };
  rec.push(st, 5, `Bucket holds up to ${capacity} tokens and refills ${rate}/s. Each request spends one token. Long-run rate ≤ ${rate}/s; bursts up to ${capacity}.`, `Bucket ${capacity} tagacha token saqlaydi va soniyasiga ${rate} ta toʻldiriladi. Har bir request bitta token sarflaydi. Uzoq muddatda tezlik ≤ ${rate}/s; burst ${capacity} tagacha.`);
  let last = 0;
  times.forEach((t, i) => {
    st.current = i;
    const before = st.tokens;
    st.tokens = Math.min(capacity, st.tokens + (t - last) * rate);
    last = t;
    st.now = t;
    const allowed = st.tokens >= 1;
    if (allowed) st.tokens -= 1;
    st.tokens = r2(st.tokens);
    st.results.push({ t, ok: allowed });
    rec.push(
      st,
      allowed ? 12 : 13,
      `t = ${t}s: lazy refill ${r2(before)} → ${r2(st.tokens + (allowed ? 1 : 0))} tokens (capped at ${capacity}). ${allowed ? `Allowed; ${st.tokens} left.` : "Fewer than 1 token → rejected (429)."}`,
      `t = ${t}s: ${r2(before)} → ${r2(st.tokens + (allowed ? 1 : 0))} token gacha toʻldirildi. ${allowed ? `Ruxsat; ${st.tokens} ta qoldi.` : "1 tadan kam token → rad etildi (429)."}`,
    );
  });
  st.current = null;
  const okCount = st.results.filter((r) => r.ok).length;
  rec.push(st, 15, `${okCount}/${times.length} allowed. State is two numbers per key — easy to keep in Redis, but the read-modify-write must be atomic (e.g. a Lua script) or concurrent servers will over-admit.`, `${times.length} tadan ${okCount} tasiga ruxsat. Har bir key uchun state ikki son — Redis'da saqlash oson, lekin read-modify-write atomik boʻlishi kerak (masalan, Lua script), aks holda parallel serverlar ortiqcha ruxsat beradi.`);
  return rec.steps;
}
