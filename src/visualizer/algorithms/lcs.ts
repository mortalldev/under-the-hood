import { splitParts } from "../core/parse";
import { recorder } from "../core/recorder";
import { fail, ok, type ParseResult } from "../core/types";

export const lcsCode = `function lcs(a: string, b: string): number {
  const dp = Array.from({ length: a.length + 1 },
    () => new Array<number>(b.length + 1).fill(0));  // row/col 0 = empty prefix
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1] + 1                  // match: extend the diagonal
        : Math.max(dp[i - 1][j], dp[i][j - 1]); // drop a char from a or from b
    }
  }
  return dp[a.length][b.length];
}`;

export interface LcsInput {
  a: string;
  b: string;
}

export interface LcsState {
  a: string;
  b: string;
  dp: (number | null)[][];
  cur: [number, number] | null;
  deps: [number, number][];
  match: boolean | null;
  path: [number, number][];
  answer: string | null;
}

export function parseLcs(raw: string): ParseResult<LcsInput> {
  const parts = splitParts(raw, 2);
  if (!parts.ok) return parts;
  const [a, b] = parts.value;
  if (a.length > 8 || b.length > 8 || /\s/.test(a + b)) return fail("Two strings, up to 8 characters each, no spaces.", "Ikki string, har biri 8 belgigacha, boʻsh joysiz.");
  return ok({ a, b });
}

export function lcsSteps({ a, b }: LcsInput) {
  const rec = recorder<LcsState>();
  const dp: (number | null)[][] = Array.from({ length: a.length + 1 }, (_, i) =>
    Array.from({ length: b.length + 1 }, (_, j) => (i === 0 || j === 0 ? 0 : null)),
  );
  const st: LcsState = { a, b, dp, cur: null, deps: [], match: null, path: [], answer: null };
  const v = (i: number, j: number) => dp[i][j] as number;

  rec.push(st, 2, `dp[i][j] = LCS length of a[0..i) and b[0..j). Row 0 and column 0 are empty prefixes → 0.`, `dp[i][j] = a[0..i) va b[0..j) ning LCS uzunligi. 0-qator va 0-ustun — boʻsh prefix'lar → 0.`);

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      st.cur = [i, j];
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = v(i - 1, j - 1) + 1;
        st.deps = [[i - 1, j - 1]];
        st.match = true;
        rec.push(st, 7, `a[${i - 1}] = b[${j - 1}] = '${a[i - 1]}': this char can end a common subsequence → dp[${i - 1}][${j - 1}] + 1 = ${dp[i][j]}.`, `a[${i - 1}] = b[${j - 1}] = '${a[i - 1]}': bu belgi umumiy subsequence'ni tugata oladi → dp[${i - 1}][${j - 1}] + 1 = ${dp[i][j]}.`);
      } else {
        dp[i][j] = Math.max(v(i - 1, j), v(i, j - 1));
        st.deps = [[i - 1, j], [i, j - 1]];
        st.match = false;
        rec.push(st, 8, `'${a[i - 1]}' ≠ '${b[j - 1]}': at least one of them is not in the LCS. Best of skipping either: max(${v(i - 1, j)}, ${v(i, j - 1)}) = ${dp[i][j]}.`, `'${a[i - 1]}' ≠ '${b[j - 1]}': ulardan kamida bittasi LCS'da yoʻq. Birini tashlab ketishning eng yaxshisi: max(${v(i - 1, j)}, ${v(i, j - 1)}) = ${dp[i][j]}.`);
      }
    }
  }

  // Traceback to recover one LCS string.
  st.deps = [];
  st.match = null;
  let i = a.length;
  let j = b.length;
  const chars: string[] = [];
  while (i > 0 && j > 0) {
    st.path.push([i, j]);
    if (a[i - 1] === b[j - 1]) {
      chars.push(a[i - 1]);
      i--;
      j--;
    } else if (v(i - 1, j) >= v(i, j - 1)) i--;
    else j--;
  }
  st.cur = null;
  st.answer = chars.reverse().join("");
  rec.push(st, 11, `dp[${a.length}][${b.length}] = ${v(a.length, b.length)}. Walking back along the decisions recovers one LCS: "${st.answer}". O(n·m) time and space (space can drop to O(min(n, m)) if you only need the length).`, `dp[${a.length}][${b.length}] = ${v(a.length, b.length)}. Qarorlar boʻylab orqaga yurib bitta LCS tiklanadi: "${st.answer}". O(n·m) vaqt va xotira (faqat uzunlik kerak boʻlsa xotira O(min(n, m)) gacha tushadi).`);
  return rec.steps;
}

/** Exponential reference for tests (inputs are tiny). */
export function lcsBrute(a: string, b: string): number {
  if (!a || !b) return 0;
  if (a[0] === b[0]) return 1 + lcsBrute(a.slice(1), b.slice(1));
  return Math.max(lcsBrute(a.slice(1), b), lcsBrute(a, b.slice(1)));
}
