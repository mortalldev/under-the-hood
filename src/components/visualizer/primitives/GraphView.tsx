"use client";

import { useId } from "react";
import type { Point } from "@/visualizer/core/layout";
import type { Tone } from "@/visualizer/core/types";
import { toneLine, toneShape } from "./tones";

export interface GraphNode extends Point {
  id: string;
  label?: string;
  tone?: Tone;
  /** Small text above the node (distance, rank, count…). */
  badge?: string;
}

export interface GraphEdge {
  from: string;
  to: string;
  label?: string;
  tone?: Tone;
  dashed?: boolean;
}

const R = 4.6;

/** Node-link diagram in a 100×60 coordinate space. */
export function GraphView({
  nodes,
  edges,
  directed = false,
  label,
  height = 60,
}: {
  nodes: readonly GraphNode[];
  edges: readonly GraphEdge[];
  directed?: boolean;
  label?: string;
  height?: number;
}) {
  const markerId = useId().replace(/:/g, "");
  const pos = new Map(nodes.map((n) => [n.id, n]));

  return (
    <figure className="w-full min-w-72 max-w-2xl">
      {label && <figcaption className="mb-1.5 text-xs font-medium text-fg-muted">{label}</figcaption>}
      <svg viewBox={`0 0 100 ${height}`} className="w-full overflow-visible" role="img" aria-label={label}>
        <defs>
          <marker id={markerId} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
            <path d="M0 0L10 5L0 10z" className="fill-fg-subtle" />
          </marker>
        </defs>
        {edges.map((e, i) => {
          const a = pos.get(e.from);
          const b = pos.get(e.to);
          if (!a || !b) return null;
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const len = Math.hypot(dx, dy) || 1;
          const ux = dx / len;
          const uy = dy / len;
          const x1 = a.x + ux * R;
          const y1 = a.y + uy * R;
          const x2 = b.x - ux * (R + (directed ? 0.8 : 0));
          const y2 = b.y - uy * (R + (directed ? 0.8 : 0));
          return (
            <g key={`${e.from}-${e.to}-${i}`}>
              <line
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                strokeWidth={e.tone && e.tone !== "default" ? 0.9 : 0.5}
                strokeDasharray={e.dashed ? "1.5 1.2" : undefined}
                markerEnd={directed ? `url(#${markerId})` : undefined}
                className={`transition-all duration-300 ${toneLine[e.tone ?? "default"]}`}
              />
              {e.label && (
                <text
                  x={(a.x + b.x) / 2 - uy * 2.2}
                  y={(a.y + b.y) / 2 + ux * 2.2 + 1}
                  textAnchor="middle"
                  className="fill-fg-muted font-mono text-[2.8px]"
                >
                  {e.label}
                </text>
              )}
            </g>
          );
        })}
        {nodes.map((n) => (
          <g key={n.id}>
            <circle
              cx={n.x}
              cy={n.y}
              r={R}
              strokeWidth={0.6}
              className={`transition-all duration-300 ${toneShape[n.tone ?? "default"]}`}
            />
            <text
              x={n.x}
              y={n.y + 1.1}
              textAnchor="middle"
              className={`fill-fg font-mono font-semibold ${(n.label ?? n.id).length > 3 ? "text-[2.3px]" : "text-[3.4px]"}`}
            >
              {n.label ?? n.id}
            </text>
            {n.badge !== undefined && (
              <text x={n.x} y={n.y - R - 1.2} textAnchor="middle" className="fill-accent font-mono text-[2.8px] font-semibold">
                {n.badge}
              </text>
            )}
          </g>
        ))}
      </svg>
    </figure>
  );
}
