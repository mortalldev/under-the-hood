import { fail, ok, type ParseResult } from "./types";

/** Parses "1, 2, 3" or "1 2 3" into numbers with bounds checking. */
export function parseNumbers(
  raw: string,
  { min = 1, max = 16, label = "array" }: { min?: number; max?: number; label?: string } = {},
): ParseResult<number[]> {
  const parts = raw.split(/[\s,]+/).filter(Boolean);
  if (parts.length < min || parts.length > max) {
    return fail(
      `The ${label} must have ${min}–${max} numbers.`,
      `${label} ${min}–${max} ta sondan iborat boʻlishi kerak.`,
    );
  }
  const nums = parts.map(Number);
  const bad = parts.find((_, i) => !Number.isFinite(nums[i]) || !Number.isInteger(nums[i]));
  if (bad !== undefined) {
    return fail(`"${bad}" is not an integer.`, `"${bad}" butun son emas.`);
  }
  if (nums.some((n) => Math.abs(n) > 999)) {
    return fail("Keep numbers between -999 and 999.", "Sonlar -999 va 999 orasida boʻlsin.");
  }
  return ok(nums);
}

/** Splits "a; b" into exactly `count` trimmed parts. */
export function splitParts(raw: string, count: number): ParseResult<string[]> {
  const parts = raw.split(";").map((p) => p.trim());
  if (parts.length !== count || parts.some((p) => p === "")) {
    return fail(
      `Expected ${count} parts separated by ";".`,
      `";" bilan ajratilgan ${count} ta qism kutilgan.`,
    );
  }
  return ok(parts);
}

export function parseInteger(raw: string, label: string, min: number, max: number): ParseResult<number> {
  const n = Number(raw.trim());
  if (!Number.isInteger(n) || n < min || n > max) {
    return fail(
      `${label} must be an integer from ${min} to ${max}.`,
      `${label} ${min} dan ${max} gacha butun son boʻlishi kerak.`,
    );
  }
  return ok(n);
}

export interface EdgeSpec {
  from: string;
  to: string;
  weight?: number;
}

/**
 * Parses an edge list such as "A-B, B-C:4" (undirected) or "A>B" (directed).
 * Node names are 1–6 alphanumeric characters.
 */
export function parseEdges(
  raw: string,
  { directed, weighted, maxNodes = 10 }: { directed: boolean; weighted: boolean; maxNodes?: number },
): ParseResult<{ nodes: string[]; edges: EdgeSpec[] }> {
  const sep = directed ? ">" : "-";
  const items = raw.split(",").map((s) => s.trim()).filter(Boolean);
  if (items.length === 0 || items.length > 20) {
    return fail("Give 1–20 edges.", "1–20 ta edge kiriting.");
  }
  const edges: EdgeSpec[] = [];
  const nodes: string[] = [];
  const pattern = new RegExp(`^([A-Za-z0-9]{1,6})\\s*\\${sep}\\s*([A-Za-z0-9]{1,6})(?:\\s*:\\s*(\\d{1,3}))?$`);
  for (const item of items) {
    const m = pattern.exec(item);
    if (!m) {
      const example = weighted ? `A${sep}B:4` : `A${sep}B`;
      return fail(`Cannot read "${item}". Use the form ${example}.`, `"${item}" oʻqib boʻlmadi. ${example} koʻrinishida yozing.`);
    }
    const [, from, to, w] = m;
    if (weighted && w === undefined) {
      return fail(`Edge "${item}" needs a weight, e.g. ${from}${sep}${to}:3.`, `"${item}" edge'iga vazn kerak, masalan ${from}${sep}${to}:3.`);
    }
    if (from === to) return fail(`Self-loop "${item}" is not allowed here.`, `"${item}" self-loop bu yerda ruxsat etilmagan.`);
    for (const n of [from, to]) if (!nodes.includes(n)) nodes.push(n);
    edges.push({ from, to, weight: weighted ? Number(w) : undefined });
  }
  if (nodes.length > maxNodes) {
    return fail(`At most ${maxNodes} nodes.`, `Koʻpi bilan ${maxNodes} ta node.`);
  }
  return ok({ nodes, edges });
}
