import type { Locale } from "@/i18n/routing";

/** A string in every supported locale. */
export type Localized = Record<Locale, string>;

/**
 * One snapshot of an algorithm. Generators produce `Step[]`; the player only
 * renders snapshots, so logic and UI never mix and stepping back is free.
 */
export interface Step<S> {
  state: S;
  /** 1-based line in the displayed code to highlight. */
  line?: number;
  /** Why this step happens, not just what changed. */
  note: Localized;
}

export type ParseResult<T> =
  | { ok: true; value: T }
  | { ok: false; error: Localized };

export const ok = <T,>(value: T): ParseResult<T> => ({ ok: true, value });

export const fail = <T,>(en: string, uz: string): ParseResult<T> => ({
  ok: false,
  error: { en, uz },
});

/** Visual emphasis applied by primitives. Kept semantic, styled in one place. */
export type Tone =
  | "default"
  | "active"
  | "compare"
  | "match"
  | "found"
  | "visited"
  | "window"
  | "muted"
  | "danger";
