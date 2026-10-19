"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { SceneEdge, SceneNode, SceneState, Text } from "@/visualizer/principles/scene";
import { useL } from "../useL";
import { toneLine, toneShape } from "./tones";

const W = 150;
const H = 46;

const size = (n: SceneNode) => ({ w: n.w ?? W, h: n.h ?? (n.sub ? 54 : H) });

/** Point where the ray from a box's centre towards (tx, ty) leaves the box. */
function borderPoint(n: SceneNode, tx: number, ty: number, pad: number) {
  const { w, h } = size(n);
  const dx = tx - n.x;
  const dy = ty - n.y;
  const t = Math.min(dx ? (w / 2 + pad) / Math.abs(dx) : Infinity, dy ? (h / 2 + pad) / Math.abs(dy) : Infinity);
  return { x: n.x + dx * t, y: n.y + dy * t };
}

const arrowTone: Record<string, string> = {
  default: "fill-fg-subtle",
  active: "fill-accent",
  match: "fill-emerald-500",
  found: "fill-emerald-500",
  danger: "fill-rose-500",
  compare: "fill-amber-500",
  visited: "fill-sky-500",
  window: "fill-accent/60",
  muted: "fill-border",
};

const badgeFill = (tone: SceneNode["tone"]) =>
  tone === "danger" ? "fill-rose-600" : tone === "match" || tone === "found" ? "fill-emerald-600" : tone === "compare" ? "fill-amber-600" : "fill-accent";

/** Boxes-and-arrows stage for principle scenes; moves, fades and recolours between frames. */
export function SceneView({ state }: { state: SceneState }) {
  const l = useL();
  const text = (t: Text | undefined) => (t === undefined ? undefined : typeof t === "string" ? t : l(t.en, t.uz));
  const byId = new Map(state.nodes.map((n) => [n.id, n]));

  return (
    <figure className="relative mx-auto w-full max-w-3xl min-w-[28rem]">
      <AnimatePresence initial={false}>
        {state.verdict && (
          <motion.figcaption
            key={state.verdict}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`absolute top-0 left-0 rounded-full px-2.5 py-1 text-xs font-semibold ${state.verdict === "bad" ? "bg-rose-500/15 text-rose-700 dark:text-rose-300" : "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"}`}
          >
            {state.verdict === "bad" ? l("✕ Problem", "✕ Muammo") : l("✓ Solution", "✓ Yechim")}
          </motion.figcaption>
        )}
      </AnimatePresence>
      <svg viewBox={`0 0 ${state.width} ${state.height}`} className="w-full overflow-visible" role="img" aria-label={state.nodes.map((n) => text(n.label)).join(", ")}>
        <AnimatePresence>
          {state.edges.map((e) => {
            const a = byId.get(e.from);
            const b = byId.get(e.to);
            return a && b ? <Edge key={`${e.from}>${e.to}`} edge={e} a={a} b={b} label={text(e.label)} /> : null;
          })}
        </AnimatePresence>
        <AnimatePresence>
          {state.nodes.map((n) => (
            <Node key={n.id} node={n} label={text(n.label) ?? n.id} sub={text(n.sub)} badge={text(n.badge)} />
          ))}
        </AnimatePresence>
      </svg>
    </figure>
  );
}

function Node({ node: n, label, sub, badge }: { node: SceneNode; label: string; sub?: string; badge?: string }) {
  const { w, h } = size(n);
  const badgeW = badge ? Math.max(28, badge.length * 6.6 + 14) : 0;
  const kind = n.kind ?? "box";
  // "muted" fades the whole group once; the box itself keeps its normal style.
  const muted = n.tone === "muted";
  const tone = muted ? "default" : n.tone;
  return (
    <motion.g
      initial={{ opacity: 0, scale: 0.7, x: n.x, y: n.y }}
      animate={{ opacity: muted ? 0.5 : 1, scale: 1, x: n.x, y: n.y }}
      exit={{ opacity: 0, scale: 0.7 }}
    >
      {kind !== "note" && (
        <rect
          x={-w / 2}
          y={-h / 2}
          width={w}
          height={h}
          rx={kind === "data" ? h / 2 : 10}
          strokeWidth={tone === "default" ? 1.25 : 2}
          strokeDasharray={kind === "interface" ? "5 4" : undefined}
          className={`transition-colors duration-300 ${toneShape[tone]}`}
        />
      )}
      {kind === "interface" && (
        <text x={-w / 2 + 2} y={-h / 2 - 6} className="fill-fg-subtle font-mono text-[10px]">
          «interface»
        </text>
      )}
      <text y={sub ? -4 : 4.5} textAnchor="middle" className={`fill-fg text-[13px] ${kind === "note" ? "font-medium" : "font-semibold"}`}>
        {label}
      </text>
      {sub && (
        <text y={13} textAnchor="middle" className="fill-fg-muted font-mono text-[10.5px]">
          {sub}
        </text>
      )}
      {badge && (
        <g transform={`translate(${w / 2 - badgeW / 2 - 6} ${-h / 2})`}>
          <rect x={-badgeW / 2} y={-10} width={badgeW} height={20} rx={10} className={badgeFill(n.tone)} />
          <text y={4} textAnchor="middle" className={`text-[10.5px] font-bold ${n.tone === "danger" || n.tone === "match" || n.tone === "found" || n.tone === "compare" ? "fill-white" : "fill-accent-fg"}`}>
            {badge}
          </text>
        </g>
      )}
    </motion.g>
  );
}

function Edge({ edge: e, a, b, label }: { edge: SceneEdge; a: SceneNode; b: SceneNode; label?: string }) {
  const reduced = useReducedMotion();
  const p1 = borderPoint(a, b.x, b.y, 3);
  const p2 = borderPoint(b, a.x, a.y, 5);
  // Arrowhead as an absolute triangle (not a rotated shape) so motion can
  // interpolate its path between frames without a transform origin.
  const len = Math.hypot(p2.x - p1.x, p2.y - p1.y) || 1;
  const ux = (p2.x - p1.x) / len;
  const uy = (p2.y - p1.y) / len;
  const head = `M${p2.x} ${p2.y}L${p2.x - ux * 9 - uy * 4.5} ${p2.y - uy * 9 + ux * 4.5}L${p2.x - ux * 9 + uy * 4.5} ${p2.y - uy * 9 - ux * 4.5}Z`;
  const tone = e.tone ?? "default";
  return (
    <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.line
        initial={false}
        animate={{ x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y }}
        strokeWidth={tone === "default" ? 1.4 : 2}
        strokeDasharray={e.dashed ? "6 5" : undefined}
        className={`transition-colors duration-300 ${toneLine[tone]}`}
      />
      <motion.path initial={false} animate={{ d: head }} className={arrowTone[tone]} />
      {label && (
        <motion.text initial={false} animate={{ x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 - 7 }} textAnchor="middle" className="fill-fg-muted font-mono text-[10.5px]">
          {label}
        </motion.text>
      )}
      {e.flow && !reduced && (
        <motion.circle
          key={`${p1.x},${p1.y},${p2.x},${p2.y}`}
          r={4}
          initial={{ cx: p1.x, cy: p1.y }}
          animate={{ cx: [p1.x, p2.x], cy: [p1.y, p2.y], opacity: [0, 1, 1, 0] }}
          transition={{ duration: 1.3, repeat: Infinity, ease: "easeInOut" }}
          className={arrowTone[tone]}
        />
      )}
    </motion.g>
  );
}
