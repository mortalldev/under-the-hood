import { recorder } from "../core/recorder";
import { fail, ok, type ParseResult } from "../core/types";

export const backpressureCode = `const source = getChunks();             // fast producer
const dest = fs.createWriteStream(path, { highWaterMark });

function produce() {
  let chunk;
  while ((chunk = source.next())) {
    const ok = dest.write(chunk);       // false ⇒ buffer reached highWaterMark
    if (!ok) {
      dest.once("drain", produce);      // pause until the buffer empties
      return;
    }
  }
  dest.end();
}
produce();
// Prefer: await pipeline(source, dest) — it wires this up (and errors) for you.`;

export interface BackpressureInput {
  produceRate: number;
  consumeRate: number;
  highWaterMark: number;
  total: number;
  respect: boolean;
}

export interface BackpressureState {
  tick: number;
  buffered: number;
  highWaterMark: number;
  produced: number;
  consumed: number;
  total: number;
  paused: boolean;
  lastWriteOk: boolean | null;
  history: number[];
  maxBuffered: number;
  drained: boolean;
  respect: boolean;
}

export function parseBackpressure(raw: string): ParseResult<BackpressureInput> {
  const parts = raw.split(/[\s,;]+/).filter(Boolean);
  if (parts.length !== 5) return fail("Format: produce, consume, highWaterMark, total, yes|no", "Format: produce, consume, highWaterMark, total, yes|no");
  const [p, c, h, t] = parts.slice(0, 4).map(Number);
  const flag = parts[4].toLowerCase();
  if (![p, c, h, t].every((x) => Number.isInteger(x) && x > 0) || p > 10 || c > 10 || h > 20 || t > 60) {
    return fail("Rates 1–10, highWaterMark 1–20, total 1–60 chunks.", "Tezliklar 1–10, highWaterMark 1–20, total 1–60 chunk.");
  }
  if (!["yes", "no", "ha", "yoq", "yoʻq"].includes(flag)) return fail('Last value: "yes" (respect backpressure) or "no".', 'Oxirgi qiymat: "yes" (backpressure hisobga olinadi) yoki "no".');
  return ok({ produceRate: p, consumeRate: c, highWaterMark: h, total: t, respect: flag === "yes" || flag === "ha" });
}

export function backpressureSteps({ produceRate, consumeRate, highWaterMark, total, respect }: BackpressureInput) {
  const rec = recorder<BackpressureState>();
  const st: BackpressureState = {
    tick: 0,
    buffered: 0,
    highWaterMark,
    produced: 0,
    consumed: 0,
    total,
    paused: false,
    lastWriteOk: null,
    history: [0],
    maxBuffered: 0,
    drained: false,
    respect,
  };
  rec.push(st, 2, `Producer makes ${produceRate} chunk(s)/tick, the destination can flush ${consumeRate}/tick, highWaterMark = ${highWaterMark} chunks. ${respect ? "The producer obeys write()'s return value." : "The producer IGNORES write()'s return value."}`, `Producer har tick'da ${produceRate} ta chunk yaratadi, destination ${consumeRate} tasini chiqara oladi, highWaterMark = ${highWaterMark} chunk. ${respect ? "Producer write() qaytargan qiymatga boʻysunadi." : "Producer write() qaytargan qiymatni E'TIBORSIZ qoldiradi."}`);

  for (let tick = 1; tick <= 80 && st.consumed < total; tick++) {
    st.tick = tick;
    st.drained = false;
    // Producer phase.
    if (!st.paused) {
      let wrote = 0;
      while (wrote < produceRate && st.produced < total) {
        st.buffered++;
        st.produced++;
        wrote++;
        st.lastWriteOk = st.buffered < highWaterMark;
        if (!st.lastWriteOk && respect) {
          st.paused = true;
          break;
        }
      }
      if (wrote > 0) {
        rec.push(
          st,
          st.paused ? 9 : 7,
          st.paused
            ? `Tick ${tick}: wrote ${wrote}; buffer = ${st.buffered} ≥ highWaterMark → write() returned false. The producer stops and waits for 'drain'. Note: the chunk WAS accepted — false is a request, not a rejection.`
            : `Tick ${tick}: wrote ${wrote}; buffer = ${st.buffered}.${!st.lastWriteOk ? " write() returned false, but this producer keeps going — memory grows." : ""}`,
          st.paused
            ? `Tick ${tick}: ${wrote} ta yozildi; buffer = ${st.buffered} ≥ highWaterMark → write() false qaytardi. Producer toʻxtaydi va 'drain' ni kutadi. E'tibor bering: chunk QABUL qilindi — false bu rad etish emas, iltimos.`
            : `Tick ${tick}: ${wrote} ta yozildi; buffer = ${st.buffered}.${!st.lastWriteOk ? " write() false qaytardi, lekin bu producer davom etmoqda — xotira oʻsmoqda." : ""}`,
        );
      }
    }
    // Consumer phase.
    const flushed = Math.min(consumeRate, st.buffered);
    st.buffered -= flushed;
    st.consumed += flushed;
    st.maxBuffered = Math.max(st.maxBuffered, st.buffered + flushed);
    if (st.paused && st.buffered === 0) {
      st.paused = false;
      st.drained = true;
    }
    st.history.push(st.buffered);
    rec.push(
      st,
      st.drained ? 9 : undefined,
      st.drained
        ? `Destination flushed ${flushed}; buffer empty → 'drain' fires, the producer resumes.`
        : `Destination flushed ${flushed} → buffer ${st.buffered}.${st.paused ? " Producer still paused." : ""}`,
      st.drained
        ? `Destination ${flushed} ta chiqardi; buffer boʻsh → 'drain' ishga tushadi, producer davom etadi.`
        : `Destination ${flushed} ta chiqardi → buffer ${st.buffered}.${st.paused ? " Producer hali toʻxtagan." : ""}`,
    );
  }
  rec.push(st, 14, respect ? `Done. Peak buffer ${st.maxBuffered} ≈ highWaterMark + one burst: memory stays bounded no matter how large the input is.` : `Done. Peak buffer ${st.maxBuffered} chunks — it grows with (produce − consume) × time. With a large file or a slow network this is how a Node process runs out of memory.`, respect ? `Tugadi. Eng katta buffer ${st.maxBuffered} ≈ highWaterMark + bitta portsiya: input qanchalik katta boʻlmasin, xotira chegaralangan.` : `Tugadi. Eng katta buffer ${st.maxBuffered} chunk — u (produce − consume) × vaqt bilan oʻsadi. Katta fayl yoki sekin tarmoq bilan Node jarayoni xotirasi aynan shunday tugaydi.`);
  return rec.steps;
}
