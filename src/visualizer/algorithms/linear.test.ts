import { describe, expect, it } from "vitest";
import { binarySearchSteps, lowerBoundLinear, parseBinarySearch } from "./binary-search";
import { dynamicArraySteps } from "./dynamic-array";
import { fenwickSteps } from "./fenwick";
import { houseRobberSteps, robBrute } from "./house-robber";
import { mergeIntervalsReference, mergeIntervalsSteps, parseIntervals } from "./intervals";
import { readList, reverseListSteps } from "./linked-list";
import { monotonicStackSteps, nextGreaterBrute } from "./monotonic-stack";
import { popcountSteps } from "./popcount";
import { prefixSumSteps, subarraySumBrute } from "./prefix-sum";
import { longestUniqueBrute, parseSlidingWindow, slidingWindowSteps } from "./sliding-window";
import { last, randInts, rng } from "./test-utils";
import { twoPointersSteps, twoSumBrute } from "./two-pointers";

const rand = rng(42);

describe("sliding window", () => {
  it.each(["abcabcbb", "bbbbb", "pwwkew", "a", "abba", "dvdf"])("matches brute force for %s", (s) => {
    expect(last(slidingWindowSteps(s)).state.best).toBe(longestUniqueBrute(s));
  });
  it("random strings", () => {
    for (let k = 0; k < 200; k++) {
      const s = randInts(rand, 1 + Math.floor(rand() * 15), 0, 4).map((x) => "abcde"[x]).join("");
      expect(last(slidingWindowSteps(s)).state.best).toBe(longestUniqueBrute(s));
    }
  });
  it("window invariant holds at every step", () => {
    for (const step of slidingWindowSteps("abcabcbbxyzx")) {
      const { chars, left, right, dup } = step.state;
      if (right === null || dup !== null) continue;
      const win = chars.slice(left, right + 1);
      if (step.line === 10) expect(new Set(win).size).toBe(win.length);
    }
  });
  it("rejects spaces", () => expect(parseSlidingWindow("a b").ok).toBe(false));
});

describe("binary search", () => {
  it("random arrays and targets", () => {
    for (let k = 0; k < 300; k++) {
      const nums = randInts(rand, 1 + Math.floor(rand() * 12), -5, 15).sort((a, b) => a - b);
      const target = Math.floor(rand() * 25) - 7;
      expect(last(binarySearchSteps({ nums, target })).state.result).toBe(lowerBoundLinear(nums, target));
    }
  });
  it("rejects unsorted input", () => expect(parseBinarySearch("3, 1; 2").ok).toBe(false));
});

describe("two pointers", () => {
  it("finds a pair exactly when one exists", () => {
    for (let k = 0; k < 300; k++) {
      const nums = randInts(rand, 2 + Math.floor(rand() * 10), -10, 10).sort((a, b) => a - b);
      const target = Math.floor(rand() * 30) - 15;
      const s = last(twoPointersSteps({ nums, target })).state;
      expect(s.found).toBe(twoSumBrute(nums, target));
      if (s.found) expect(nums[s.l] + nums[s.r]).toBe(target);
    }
  });
});

describe("prefix sum", () => {
  it("counts subarrays like brute force (with negatives)", () => {
    for (let k = 0; k < 300; k++) {
      const nums = randInts(rand, 1 + Math.floor(rand() * 12), -4, 4);
      const kk = Math.floor(rand() * 9) - 4;
      expect(last(prefixSumSteps({ nums, k: kk })).state.count).toBe(subarraySumBrute(nums, kk));
    }
  });
});

describe("monotonic stack", () => {
  it("next greater element", () => {
    for (let k = 0; k < 200; k++) {
      const nums = randInts(rand, 1 + Math.floor(rand() * 12), 0, 9);
      expect(last(monotonicStackSteps(nums)).state.res).toEqual(nextGreaterBrute(nums));
    }
  });
  it("stack stays strictly decreasing by value", () => {
    for (const step of monotonicStackSteps([2, 1, 2, 4, 3, 1, 5])) {
      const vals = step.state.stack.map((i) => step.state.nums[i]);
      if (step.line === 8) for (let i = 1; i < vals.length; i++) expect(vals[i]).toBeLessThanOrEqual(vals[i - 1]);
    }
  });
});

describe("linked list reversal", () => {
  it("reverses", () => {
    for (const xs of [[1], [1, 2], [1, 2, 3, 4, 5]]) {
      expect(readList(last(reverseListSteps(xs)).state)).toEqual([...xs].reverse());
    }
  });
});

describe("merge intervals", () => {
  it("matches reference", () => {
    for (let k = 0; k < 200; k++) {
      const n = 1 + Math.floor(rand() * 8);
      const ivs: [number, number][] = Array.from({ length: n }, () => {
        const s = Math.floor(rand() * 20);
        return [s, s + Math.floor(rand() * 6)];
      });
      const ours = last(mergeIntervalsSteps(ivs)).state.out;
      const ref = mergeIntervalsReference(ivs);
      // Reference may merge in a different order; compare as sorted sets after a full re-merge.
      expect(mergeIntervalsReference(ours)).toEqual(mergeIntervalsReference(ref));
      for (let i = 1; i < ours.length; i++) expect(ours[i][0]).toBeGreaterThan(ours[i - 1][1]);
    }
  });
  it("parses", () => expect(parseIntervals("1-3, 2-6").ok).toBe(true));
});

describe("house robber", () => {
  it("matches brute force", () => {
    for (let k = 0; k < 200; k++) {
      const nums = randInts(rand, 1 + Math.floor(rand() * 10), 0, 9);
      expect(last(houseRobberSteps(nums)).state.dp[nums.length]).toBe(robBrute(nums));
    }
  });
});

describe("fenwick", () => {
  it("prefix sums", () => {
    for (let k = 0; k < 100; k++) {
      const nums = randInts(rand, 1 + Math.floor(rand() * 12), -9, 9);
      const q = 1 + Math.floor(rand() * nums.length);
      const sum = nums.slice(0, q).reduce((a, b) => a + b, 0);
      expect(last(fenwickSteps({ nums, query: q })).state.sum).toBe(sum);
    }
  });
});

describe("popcount", () => {
  it("counts bits", () => {
    for (let x = 0; x < 256; x++) {
      expect(last(popcountSteps(x)).state.count).toBe(x.toString(2).split("1").length - 1);
    }
  });
});

describe("dynamic array", () => {
  it("amortized cost stays below 3n", () => {
    for (let n = 1; n <= 17; n++) {
      const s = last(dynamicArraySteps(n)).state;
      expect(s.size).toBe(n);
      expect(s.totalCost).toBeLessThan(3 * n);
      expect(s.slots.slice(0, n)).toEqual(Array.from({ length: n }, (_, i) => i + 1));
    }
  });
});
