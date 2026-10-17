import type { ReactNode } from "react";

/** A row of small labelled values (best = 3, count = 2…). */
export function Stats({ items }: { items: readonly [string, ReactNode][] }) {
  return (
    <dl className="flex flex-wrap gap-2 text-xs">
      {items.map(([k, v]) => (
        <div key={k} className="flex items-baseline gap-1.5 rounded-md border border-border bg-bg px-2 py-1">
          <dt className="text-fg-muted">{k}</dt>
          <dd className="font-mono font-semibold">{v}</dd>
        </div>
      ))}
    </dl>
  );
}
