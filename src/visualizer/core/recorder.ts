import type { Step } from "./types";

/**
 * Collects snapshots while a generator mutates a working state. Each push
 * deep-copies the state so later mutations never leak into earlier steps.
 */
export function recorder<S>() {
  const steps: Step<S>[] = [];
  return {
    steps,
    push(state: S, line: number | undefined, en: string, uz: string) {
      steps.push({ state: structuredClone(state), line, note: { en, uz } });
    },
  };
}
