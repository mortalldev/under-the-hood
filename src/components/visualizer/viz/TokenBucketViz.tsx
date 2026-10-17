"use client";

import { parseTokenBucket, tokenBucketCode, tokenBucketSteps } from "@/visualizer/algorithms/token-bucket";
import { useL } from "../useL";
import { Visualizer } from "../Visualizer";

export function TokenBucketViz() {
  const l = useL();
  return (
    <Visualizer
      title={{ en: "Rate limiting with a token bucket", uz: "Token bucket bilan rate limiting" }}
      code={tokenBucketCode}
      defaultInput="3; 1; 0, 0.1, 0.2, 0.3, 1.2, 1.4, 2.5, 2.6, 2.7, 6"
      parse={parseTokenBucket}
      generate={tokenBucketSteps}
      inputLabel={{ en: "capacity; refill per second; request times (s)", uz: "capacity; soniyasiga toʻldirish; request vaqtlari (s)" }}
      render={(s) => (
        <div className="flex flex-col gap-4">
          <div className="flex items-end gap-3">
            <div className="relative flex h-28 w-16 flex-col-reverse overflow-hidden rounded-b-xl border-2 border-t-0 border-fg-subtle">
              <div className="w-full bg-accent/50 transition-all duration-300" style={{ height: `${(s.tokens / s.capacity) * 100}%` }} />
            </div>
            <p className="font-mono text-sm">
              {s.tokens} / {s.capacity} {l("tokens", "token")}
            </p>
          </div>
          <ol className="flex flex-wrap gap-1 font-mono text-xs">
            {s.results.map((r, i) => (
              <li
                key={i}
                className={`rounded border px-2 py-1 ${r.ok ? "border-emerald-500 bg-emerald-500/15" : "border-rose-500 bg-rose-500/15"} ${i === s.current ? "ring-2 ring-accent" : ""}`}
              >
                t={r.t}s {r.ok ? "200" : "429"}
              </li>
            ))}
          </ol>
        </div>
      )}
    />
  );
}
