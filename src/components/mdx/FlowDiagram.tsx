import { useTranslations } from "next-intl";
import { useId } from "react";

export interface FlowNode {
  id: string;
  label: string;
  /** Center position in a 100 × height coordinate space. */
  x: number;
  y: number;
  w?: number;
  sub?: string;
  kind?: "client" | "service" | "store" | "queue" | "edge" | "note";
}

export interface FlowEdge {
  from: string;
  to: string;
  label?: string;
  dashed?: boolean;
  both?: boolean;
}

const fill: Record<NonNullable<FlowNode["kind"]>, string> = {
  client: "fill-sky-500/15 stroke-sky-500",
  service: "fill-accent/15 stroke-accent",
  store: "fill-emerald-500/15 stroke-emerald-500",
  queue: "fill-amber-500/15 stroke-amber-500",
  edge: "fill-fuchsia-500/15 stroke-fuchsia-500",
  note: "fill-surface-2 stroke-border",
};

const H_BOX = 9;

/**
 * Rough rendered width of `text` at `size` viewBox units (average glyph ≈ 0.56em).
 * When a label would overflow its box, we pass `textLength` so the browser
 * compresses it to fit instead of spilling into neighbouring boxes.
 */
const fitProps = (text: string, size: number, room: number) =>
  text.length * size * 0.56 > room ? { textLength: room, lengthAdjust: "spacingAndGlyphs" as const } : {};

const LABEL_SIZE = 2.4;

interface Rect {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

const overlaps = (r: Rect, q: Rect) => r.x0 < q.x1 && q.x0 < r.x1 && r.y0 < q.y1 && q.y0 < r.y1;

/**
 * Edge label placement. Labels are often longer than the gap between boxes, so
 * we try a few spots — above the row for same-row edges, otherwise beside the
 * line at several points along it, on either side — and take the first one
 * that hits no box and stays inside the diagram. A halo in the card colour
 * keeps the text readable where it still crosses a line.
 */
function EdgeLabel({ text, a, b, x1, y1, x2, y2, nodes, height }: { text: string; a: FlowNode; b: FlowNode; x1: number; y1: number; x2: number; y2: number; nodes: FlowNode[]; height: number }) {
  const width = text.length * LABEL_SIZE * 0.56;
  const boxes: Rect[] = nodes.map((n) => {
    const w = n.w ?? 18;
    return { x0: n.x - w / 2 - 0.4, y0: n.y - H_BOX / 2 - 0.4, x1: n.x + w / 2 + 0.4, y1: n.y + H_BOX / 2 + 0.4 };
  });
  // Candidate = baseline point + anchor.
  const candidates: { x: number; y: number; anchor: "start" | "middle" | "end" }[] = [];
  if (Math.abs(b.y - a.y) <= H_BOX / 2) {
    candidates.push({ x: (x1 + x2) / 2, y: Math.min(a.y, b.y) - H_BOX / 2 - 1.2, anchor: "middle" });
    candidates.push({ x: (x1 + x2) / 2, y: Math.max(a.y, b.y) + H_BOX / 2 + 3, anchor: "middle" });
  }
  for (const t of [0.5, 0.35, 0.65, 0.22, 0.78]) {
    const px = x1 + (x2 - x1) * t;
    const py = y1 + (y2 - y1) * t + 0.8;
    candidates.push({ x: px + 1.2, y: py, anchor: "start" }, { x: px - 1.2, y: py, anchor: "end" }, { x: px, y: py - 1.6, anchor: "middle" });
  }
  const rectOf = (c: (typeof candidates)[number]): Rect => {
    const x0 = c.anchor === "start" ? c.x : c.anchor === "end" ? c.x - width : c.x - width / 2;
    return { x0, y0: c.y - LABEL_SIZE * 0.85, x1: x0 + width, y1: c.y + LABEL_SIZE * 0.25 };
  };
  const fits = (r: Rect) => r.x0 >= 0.5 && r.x1 <= 99.5 && r.y0 >= 0.3 && r.y1 <= height - 0.3 && !boxes.some((q) => overlaps(r, q));
  const pick = candidates.find((c) => fits(rectOf(c))) ?? candidates[0];

  return (
    <text
      x={pick.x}
      y={pick.y}
      textAnchor={pick.anchor}
      strokeWidth="0.9"
      strokeLinejoin="round"
      className="fill-fg-muted stroke-surface-1 text-[2.4px] [paint-order:stroke]"
    >
      {text}
    </text>
  );
}

/** Static architecture diagram (server component, no JS). */
export function FlowDiagram({ nodes, edges, height = 60, caption }: { nodes: FlowNode[]; edges: FlowEdge[]; height?: number; caption?: string }) {
  const t = useTranslations("Diagram");
  const marker = useId().replace(/:/g, "");
  const byId = new Map(nodes.map((n) => [n.id, n]));

  // Clip a segment between two box centers to the box borders.
  const clip = (a: FlowNode, b: FlowNode) => {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const wa = (a.w ?? 18) / 2;
    const wb = (b.w ?? 18) / 2;
    const ta = Math.min(dx ? wa / Math.abs(dx) : Infinity, dy ? H_BOX / 2 / Math.abs(dy) : Infinity);
    const tb = Math.min(dx ? wb / Math.abs(dx) : Infinity, dy ? H_BOX / 2 / Math.abs(dy) : Infinity);
    return { x1: a.x + dx * ta, y1: a.y + dy * ta, x2: b.x - dx * tb, y2: b.y - dy * tb };
  };

  return (
    <figure className="not-prose -mx-4 my-8 border-y border-border bg-surface-1 px-4 py-3 sm:mx-0 sm:rounded-xl sm:border sm:p-3">
      <p className="mb-2 text-xs text-fg-subtle sm:hidden" aria-hidden="true">
        ← {t("scrollHint")} →
      </p>
      <div className="-mx-4 overflow-x-auto overscroll-x-contain px-4 sm:-mx-3 sm:px-3">
        <svg viewBox={`0 0 100 ${height}`} className="w-full min-w-[34rem]" role="img" aria-label={caption}>
          <defs>
            <marker id={marker} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
              <path d="M0 0L10 5L0 10z" className="fill-fg-muted" />
            </marker>
          </defs>
          {edges.map((e, i) => {
            const a = byId.get(e.from);
            const b = byId.get(e.to);
            if (!a || !b) return null;
            const { x1, y1, x2, y2 } = clip(a, b);
            return (
              <g key={i}>
                <line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  className="stroke-fg-muted"
                  strokeWidth="0.35"
                  strokeDasharray={e.dashed ? "1.2 1" : undefined}
                  markerEnd={`url(#${marker})`}
                  markerStart={e.both ? `url(#${marker})` : undefined}
                />
                {e.label && <EdgeLabel text={e.label} a={a} b={b} x1={x1} y1={y1} x2={x2} y2={y2} nodes={nodes} height={height} />}
              </g>
            );
          })}
          {nodes.map((n) => {
            const w = n.w ?? 18;
            return (
              <g key={n.id}>
                <rect x={n.x - w / 2} y={n.y - H_BOX / 2} width={w} height={H_BOX} rx={n.kind === "store" ? 3.5 : 1.5} strokeWidth="0.35" className={fill[n.kind ?? "service"]} />
                <text x={n.x} y={n.sub ? n.y - 0.3 : n.y + 1} textAnchor="middle" className="fill-fg text-[2.8px] font-semibold" {...fitProps(n.label, 2.8, w - 1.6)}>
                  {n.label}
                </text>
                {n.sub && (
                  <text x={n.x} y={n.y + 2.8} textAnchor="middle" className="fill-fg-muted text-[2.1px]" {...fitProps(n.sub, 2.1, w - 1.6)}>
                    {n.sub}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>
      {caption && <figcaption className="mt-2 text-xs text-fg-muted">{caption}</figcaption>}
      {/* Phones: the same graph as a readable list, since diagram text gets small. */}
      <details className="mt-2 text-sm sm:hidden">
        <summary className="inline-flex min-h-10 cursor-pointer items-center text-xs font-medium text-fg-muted">{t("connections")}</summary>
        <ul className="mt-1 space-y-1.5">
          {edges.map((e, i) => {
            const a = byId.get(e.from);
            const b = byId.get(e.to);
            if (!a || !b) return null;
            return (
              <li key={i} className="rounded-md border border-border bg-bg px-3 py-2">
                <span className="font-medium">{a.label}</span>
                <span aria-hidden="true" className="mx-1.5 text-fg-subtle">{e.both ? "↔" : "→"}</span>
                <span className="font-medium">{b.label}</span>
                {e.label && <span className="block text-xs text-fg-muted">{e.label}</span>}
              </li>
            );
          })}
        </ul>
      </details>
    </figure>
  );
}
