"use client";

import type { Tone } from "@/visualizer/core/types";
import { toneBox } from "./tones";

/** 2-D table, e.g. a DP matrix. Tones are keyed by "row,col". */
export function GridView({
  cells,
  rowHeaders,
  colHeaders,
  tones = {},
  label,
  corner = "",
}: {
  cells: readonly (readonly (string | number | null)[])[];
  rowHeaders?: readonly string[];
  colHeaders?: readonly string[];
  tones?: Partial<Record<string, Tone>>;
  label?: string;
  corner?: string;
}) {
  return (
    <figure className="min-w-max">
      {label && <figcaption className="mb-1.5 text-xs font-medium text-fg-muted">{label}</figcaption>}
      <table className="border-separate border-spacing-1 font-mono text-xs">
        {colHeaders && (
          <thead>
            <tr>
              {rowHeaders && <th className="size-8 text-fg-subtle">{corner}</th>}
              {colHeaders.map((h, c) => (
                <th key={c} scope="col" className="size-8 font-semibold text-fg-muted">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
        )}
        <tbody>
          {cells.map((row, r) => (
            <tr key={r}>
              {rowHeaders && (
                <th scope="row" className="size-8 font-semibold text-fg-muted">
                  {rowHeaders[r]}
                </th>
              )}
              {row.map((v, c) => (
                <td
                  key={c}
                  className={`size-8 rounded border text-center transition-colors duration-300 ${toneBox[tones[`${r},${c}`] ?? "default"]}`}
                >
                  {v ?? ""}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
