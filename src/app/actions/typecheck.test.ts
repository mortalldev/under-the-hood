import { describe, expect, it } from "vitest";
import { puzzles, type PuzzleId } from "@/content/puzzles";
import { typecheckPuzzle } from "./typecheck";

describe("type puzzles", () => {
  for (const id of Object.keys(puzzles) as PuzzleId[]) {
    it(`${id}: solution passes, starter fails`, async () => {
      const good = await typecheckPuzzle(id, puzzles[id].solution);
      expect(good.errors).toEqual([]);
      const bad = await typecheckPuzzle(id, puzzles[id].starter);
      expect(bad.ok).toBe(false);
    }, 30_000);
  }
  it("rejects unknown puzzles and huge input", async () => {
    expect((await typecheckPuzzle("nope", "")).ok).toBe(false);
    expect((await typecheckPuzzle("my-pick", "x".repeat(5000))).ok).toBe(false);
  });
});
