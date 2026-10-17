import type { Tone } from "@/visualizer/core/types";

/** Box styles (HTML primitives). */
export const toneBox: Record<Tone, string> = {
  default: "border-border bg-bg",
  active: "border-accent bg-accent/20 ring-2 ring-accent/40",
  compare: "border-amber-500 bg-amber-500/20",
  match: "border-emerald-500 bg-emerald-500/15",
  found: "border-emerald-500 bg-emerald-500/35 font-bold",
  visited: "border-sky-500/70 bg-sky-500/10",
  window: "border-accent/60 bg-accent/10",
  muted: "border-border bg-bg opacity-40",
  danger: "border-rose-500 bg-rose-500/20",
};

/** Shape styles (SVG primitives). */
export const toneShape: Record<Tone, string> = {
  default: "fill-bg stroke-fg-subtle",
  active: "fill-accent/30 stroke-accent",
  compare: "fill-amber-500/25 stroke-amber-500",
  match: "fill-emerald-500/20 stroke-emerald-500",
  found: "fill-emerald-500/45 stroke-emerald-500",
  visited: "fill-sky-500/15 stroke-sky-500",
  window: "fill-accent/15 stroke-accent/60",
  muted: "fill-bg stroke-border opacity-40",
  danger: "fill-rose-500/25 stroke-rose-500",
};

export const toneLine: Record<Tone, string> = {
  default: "stroke-fg-subtle/60",
  active: "stroke-accent",
  compare: "stroke-amber-500",
  match: "stroke-emerald-500",
  found: "stroke-emerald-500",
  visited: "stroke-sky-500",
  window: "stroke-accent/60",
  muted: "stroke-border opacity-50",
  danger: "stroke-rose-500",
};

export const toneText: Record<Tone, string> = {
  default: "text-fg-muted",
  active: "text-accent",
  compare: "text-amber-600 dark:text-amber-400",
  match: "text-emerald-600 dark:text-emerald-400",
  found: "text-emerald-600 dark:text-emerald-400",
  visited: "text-sky-600 dark:text-sky-400",
  window: "text-accent",
  muted: "text-fg-subtle",
  danger: "text-rose-600 dark:text-rose-400",
};
