import { describe, expect, it } from "vitest";
import { principles } from "@/content/principles/registry";
import { sceneSteps, type Frame, type Scene } from "./scene";
import { scenes } from "./scenes";

const box = (s: Scene, id: string, x: number, y: number) => {
  const n = s.nodes[id];
  const w = n.w ?? 150;
  const h = n.h ?? (n.sub ? 54 : 46);
  return { l: x - w / 2, r: x + w / 2, t: y - h / 2, b: y + h / 2 };
};

describe("principle scenes", () => {
  it("every principle has exactly one scene", () => {
    expect(Object.keys(scenes).sort()).toEqual(principles.map((p) => p.slug).sort());
  });

  for (const [slug, scene] of Object.entries(scenes)) {
    describe(slug, () => {
      const steps = sceneSteps(scene);
      const lines = scene.code.split("\n").length;
      const ids = new Set(Object.keys(scene.nodes));

      it("frames only reference known nodes", () => {
        const refs = (f: Frame) => [
          ...(f.add ?? []),
          ...(f.remove ?? []),
          ...Object.keys(f.tone ?? {}),
          ...Object.keys(f.at ?? {}),
          ...Object.keys(f.badge ?? {}),
          ...Object.keys(f.relabel ?? {}),
          ...[...(f.edges ?? []), ...(f.addEdges ?? [])].flatMap(([a, b]) => [a, b]),
        ];
        for (const f of scene.frames) for (const id of refs(f)) expect(ids, `${slug}: unknown node "${id}"`).toContain(id);
      });

      it("arrows connect visible nodes, lines exist, notes are bilingual", () => {
        scene.frames.forEach((f, i) => {
          const shown = new Set(steps[i].state.nodes.map((n) => n.id));
          for (const [a, b] of [...(f.edges ?? []), ...(f.addEdges ?? [])]) {
            expect(shown.has(a) && shown.has(b), `${slug} frame ${i + 1}: arrow ${a}>${b} to a hidden node`).toBe(true);
          }
          if (f.line !== undefined) expect(f.line).toBeGreaterThanOrEqual(1);
          if (f.line !== undefined) expect(f.line).toBeLessThanOrEqual(lines);
          expect(f.note.en.length).toBeGreaterThan(0);
          expect(f.note.uz.length).toBeGreaterThan(0);
        });
      });

      it("boxes stay on stage and never overlap", () => {
        const width = scene.width ?? 640;
        const height = scene.height ?? 300;
        steps.forEach(({ state }, i) => {
          const boxes = state.nodes.map((n) => ({ id: n.id, ...box(scene, n.id, n.x, n.y) }));
          for (const b of boxes) {
            expect(b.l >= 0 && b.r <= width && b.t >= 0 && b.b <= height, `${slug} frame ${i + 1}: ${b.id} off stage`).toBe(true);
          }
          for (let a = 0; a < boxes.length; a++)
            for (let c = a + 1; c < boxes.length; c++) {
              const p = boxes[a];
              const q = boxes[c];
              const overlap = p.l < q.r && q.l < p.r && p.t < q.b && q.t < p.b;
              expect(overlap, `${slug} frame ${i + 1}: ${p.id} overlaps ${q.id}`).toBe(false);
            }
        });
      });
    });
  }
});
