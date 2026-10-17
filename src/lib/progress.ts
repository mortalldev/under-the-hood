"use client";

import { useSyncExternalStore } from "react";

/** Review intervals in days: each successful recall moves to the next one. */
const INTERVALS = [1, 3, 7, 16, 35] as const;
const DAY = 24 * 60 * 60 * 1000;
const KEY = "uth-progress-v1";

export interface ReviewItem {
  stage: number;
  due: number;
}

export interface ProgressData {
  done: string[];
  review: Record<string, ReviewItem>;
}

const EMPTY: ProgressData = { done: [], review: {} };
let cache: ProgressData | null = null;
const listeners = new Set<() => void>();

function read(): ProgressData {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw) as Partial<ProgressData>;
    return { done: Array.isArray(parsed.done) ? parsed.done : [], review: parsed.review ?? {} };
  } catch {
    return EMPTY;
  }
}

function write(next: ProgressData) {
  cache = next;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // Storage may be unavailable (private mode); keep in-memory state.
  }
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) {
      cache = null;
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

const getSnapshot = () => (cache ??= read());
const getServerSnapshot = () => EMPTY;

export function useProgress() {
  const data = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const current = () => getSnapshot();
  return {
    data,
    isDone: (id: string) => data.done.includes(id),
    inReview: (id: string) => id in data.review,
    toggleDone(id: string) {
      const d = current();
      write({ ...d, done: d.done.includes(id) ? d.done.filter((x) => x !== id) : [...d.done, id] });
    },
    toggleReview(id: string) {
      const d = current();
      const review = { ...d.review };
      if (id in review) delete review[id];
      else review[id] = { stage: 0, due: Date.now() + INTERVALS[0] * DAY };
      write({ ...d, review });
    },
    grade(id: string, remembered: boolean) {
      const d = current();
      const item = d.review[id];
      if (!item) return;
      const stage = remembered ? Math.min(item.stage + 1, INTERVALS.length - 1) : 0;
      write({ ...d, review: { ...d.review, [id]: { stage, due: Date.now() + INTERVALS[stage] * DAY } } });
    },
  };
}
