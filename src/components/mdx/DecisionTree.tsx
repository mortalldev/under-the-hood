"use client";

import { useState } from "react";
import { useL } from "@/components/visualizer/useL";

export interface DecisionNode {
  id: string;
  /** A question with options, or a final answer. */
  question?: string;
  options?: { label: string; next: string }[];
  answer?: string;
  detail?: string;
}

/** Click-through decision flow. Data comes from MDX, already in the page's language. */
export function DecisionTree({ title, nodes, start }: { title: string; nodes: DecisionNode[]; start: string }) {
  const l = useL();
  const [path, setPath] = useState<string[]>([start]);
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const current = byId.get(path[path.length - 1]);

  return (
    <section aria-label={title} className="not-prose my-8 rounded-xl border border-border bg-surface-1 p-4">
      <h3 className="text-sm font-semibold">{title}</h3>
      <ol className="mt-3 flex flex-wrap items-center gap-1 text-xs text-fg-muted">
        {path.slice(0, -1).map((id, i) => (
          <li key={i} className="flex items-center gap-1">
            <button type="button" className="min-h-8 rounded px-2 py-1 hover:bg-surface-2 hover:text-fg" onClick={() => setPath(path.slice(0, i + 1))}>
              {byId.get(id)?.question}
            </button>
            <span aria-hidden="true">›</span>
          </li>
        ))}
      </ol>
      {current?.question && (
        <div className="mt-3">
          <p className="font-medium">{current.question}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {current.options?.map((o) => (
              <button key={o.label} type="button" onClick={() => setPath([...path, o.next])} className="min-h-11 rounded-md border border-border bg-bg px-3 py-2 text-left text-sm hover:border-accent hover:text-accent sm:min-h-0">
                {o.label}
              </button>
            ))}
          </div>
        </div>
      )}
      {current?.answer && (
        <div className="mt-3 rounded-lg border border-emerald-500/50 bg-emerald-500/10 p-3">
          <p className="font-semibold">{current.answer}</p>
          {current.detail && <p className="mt-1 text-sm text-fg-muted">{current.detail}</p>}
        </div>
      )}
      {path.length > 1 && (
        <button type="button" onClick={() => setPath([start])} className="mt-3 text-xs text-fg-muted underline hover:text-fg">
          {l("Start over", "Boshidan boshlash")}
        </button>
      )}
    </section>
  );
}
