"use client";

import { useCallback } from "react";
import { ok } from "@/visualizer/core/types";
import { sceneSteps, type SceneState } from "@/visualizer/principles/scene";
import { scenes } from "@/visualizer/principles/scenes";
import { SceneView } from "../primitives/SceneView";
import { Visualizer } from "../Visualizer";

const parse = () => ok(null);
const render = (s: SceneState) => <SceneView state={s} />;

/** Step-through animation of one principle: `<PrincipleViz id="dry" />`. */
export function PrincipleViz({ id }: { id: string }) {
  const scene = scenes[id];
  const generate = useCallback(() => sceneSteps(scene), [scene]);
  if (!scene) throw new Error(`Unknown principle scene "${id}"`);
  return (
    <Visualizer<null, SceneState>
      title={scene.title}
      code={scene.code}
      defaultInput=""
      parse={parse}
      generate={generate}
      render={render}
      hideInput
      stacked
    />
  );
}
