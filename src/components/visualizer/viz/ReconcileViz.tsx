"use client";

import { useCallback } from "react";
import { indexCode, parseReconcile, reconcileCode, reconcileSteps, type KeyMode, type OpKind, type ReconcileInput } from "@/visualizer/algorithms/reconciliation";
import type { Tone } from "@/visualizer/core/types";
import { ArrayView, Stats, TimelineView } from "../primitives";
import { useL } from "../useL";
import { Visualizer } from "../Visualizer";

const opTone: Record<OpKind, Tone> = { keep: "visited", update: "compare", move: "active", insert: "match", remove: "danger" };

export function ReconcileViz({ mode = "keyed" }: { mode?: KeyMode }) {
  const l = useL();
  const generate = useCallback((input: ReconcileInput) => reconcileSteps(input, mode), [mode]);
  return (
    <Visualizer
      title={mode === "keyed" ? { en: "Reconciling a keyed list", uz: "Keyed roʻyxatni reconciliation qilish" } : { en: "Reconciling with key={index}", uz: "key={index} bilan reconciliation" }}
      code={mode === "keyed" ? reconcileCode : indexCode}
      defaultInput={mode === "keyed" ? "A B C D; D A B C" : "A B C; B C"}
      parse={parseReconcile}
      generate={generate}
      inputLabel={{ en: "old keys; new keys", uz: "eski key'lar; yangi key'lar" }}
      presets={
        mode === "keyed"
          ? [
              { label: l("last → first", "oxirgi → birinchi"), input: "A B C D; D A B C" },
              { label: l("first → last", "birinchi → oxirgi"), input: "A B C D; B C D A" },
              { label: l("insert + delete", "qoʻshish + oʻchirish"), input: "A B C D; A C X D" },
              { label: l("reverse", "teskari"), input: "A B C D; D C B A" },
            ]
          : [
              { label: l("delete first", "birinchisini oʻchirish"), input: "A B C; B C" },
              { label: l("prepend", "boshiga qoʻshish"), input: "A B C; X A B C" },
              { label: l("append", "oxiriga qoʻshish"), input: "A B C; A B C X" },
            ]
      }
      render={(s) => (
        <div className="flex flex-col gap-4">
          <ArrayView label={l("before", "oldin")} items={s.before} tones={Object.fromEntries(s.oldTones.map((t, i) => [i, t ? opTone[t] : undefined]))} />
          <ArrayView
            label={l("after", "keyin")}
            items={s.after}
            tones={Object.fromEntries(s.newTones.map((t, i) => [i, t ? opTone[t] : undefined]))}
            pointers={s.i === null ? [] : [{ index: s.i, label: "i" }]}
          />
          {mode === "index" && (
            <ArrayView label={l("state shown at each position came from", "har bir pozitsiyadagi state qayerdan kelgan")} items={s.stateFrom.map((x) => (x ? `${x}'s` : "new"))} showIndex={false} />
          )}
          <div className="flex flex-wrap items-start gap-6">
            <TimelineView label={l("DOM operations", "DOM amallari")} entries={s.ops.map((o) => o.text)} />
            {mode === "keyed" && <Stats items={[["lastPlacedIndex", s.lastPlacedIndex]]} />}
          </div>
        </div>
      )}
    />
  );
}
