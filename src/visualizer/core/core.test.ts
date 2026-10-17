import { describe, expect, it } from "vitest";
import { heapLayout, treeLayout } from "./layout";
import { parseEdges, parseNumbers, splitParts } from "./parse";
import { recorder } from "./recorder";

describe("recorder", () => {
  it("snapshots are isolated from later mutation", () => {
    const rec = recorder<{ xs: number[] }>();
    const state = { xs: [1] };
    rec.push(state, 1, "a", "a");
    state.xs.push(2);
    rec.push(state, 2, "b", "b");
    expect(rec.steps[0].state.xs).toEqual([1]);
    expect(rec.steps[1].state.xs).toEqual([1, 2]);
  });
});

describe("parsers", () => {
  it("parseNumbers validates", () => {
    expect(parseNumbers("1, 2 3")).toEqual({ ok: true, value: [1, 2, 3] });
    expect(parseNumbers("1, x").ok).toBe(false);
    expect(parseNumbers("").ok).toBe(false);
    expect(parseNumbers("1.5").ok).toBe(false);
  });
  it("splitParts requires exact count", () => {
    expect(splitParts("a; b", 2).ok).toBe(true);
    expect(splitParts("a", 2).ok).toBe(false);
  });
  it("parseEdges handles weights and direction", () => {
    const r = parseEdges("A-B:4, B-C:1", { directed: false, weighted: true });
    expect(r.ok && r.value.nodes).toEqual(["A", "B", "C"]);
    expect(parseEdges("A-B", { directed: false, weighted: true }).ok).toBe(false);
    expect(parseEdges("A>B", { directed: true, weighted: false }).ok).toBe(true);
    expect(parseEdges("A-A", { directed: false, weighted: false }).ok).toBe(false);
  });
});

describe("layouts", () => {
  it("centers parents over children", () => {
    const kids: Record<string, string[]> = { r: ["a", "b"], a: [], b: [] };
    const pos = treeLayout("r", (id) => kids[id]);
    expect(pos.r.x).toBeCloseTo((pos.a.x + pos.b.x) / 2);
    expect(pos.a.y).toBeGreaterThan(pos.r.y);
  });
  it("heap layout puts children below parents", () => {
    const p = heapLayout(7);
    expect(p[1].y).toBeGreaterThan(p[0].y);
    expect(p[3].x).toBeLessThan(p[4].x);
  });
});
