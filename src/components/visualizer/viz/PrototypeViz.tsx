"use client";

import { parsePrototypeKey, prototypeCode, prototypeSteps } from "@/visualizer/algorithms/prototype-chain";
import { Visualizer } from "../Visualizer";

export function PrototypeViz() {
  return (
    <Visualizer
      title={{ en: "Property lookup along the prototype chain", uz: "Prototype zanjiri boʻylab property qidiruvi" }}
      code={prototypeCode}
      defaultInput="speak"
      parse={parsePrototypeKey}
      generate={prototypeSteps}
      inputLabel={{ en: "Property name (key)", uz: "Property nomi (key)" }}
      presets={["name", "bark", "speak", "toString", "hasOwnProperty", "fly"].map((k) => ({ label: k, input: k }))}
      render={(s) => (
        <ol className="flex flex-wrap items-center gap-2 text-xs">
          {s.chain.map((o, i) => {
            const state = s.found === i ? "found" : s.index === i ? "active" : s.index !== null && i < s.index ? "passed" : "idle";
            return (
              <li key={o.id} className="flex items-center gap-2">
                <div
                  className={`min-w-36 rounded-lg border p-2 transition-colors ${
                    state === "found" ? "border-emerald-500 bg-emerald-500/15" : state === "active" ? "border-accent bg-accent/15" : state === "passed" ? "border-border opacity-50" : "border-border bg-bg"
                  }`}
                >
                  <p className="mb-1 font-semibold">{o.label}</p>
                  <ul className="flex flex-wrap gap-1 font-mono">
                    {o.props.map((p) => (
                      <li key={p} className={`rounded border px-1.5 py-0.5 ${p === s.key ? "border-emerald-500 bg-emerald-500/20 font-bold" : "border-border"}`}>
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
                <span aria-hidden="true" className="font-mono text-fg-subtle">
                  {i < s.chain.length - 1 ? "→" : "→ null"}
                </span>
              </li>
            );
          })}
        </ol>
      )}
    />
  );
}
