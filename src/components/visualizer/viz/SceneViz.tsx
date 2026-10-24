"use client";

import { useCallback } from "react";
import { ok } from "@/visualizer/core/types";
import { sceneSteps, type Scene, type SceneState } from "@/visualizer/principles/scene";
import { SceneView } from "../primitives/SceneView";
import { Visualizer } from "../Visualizer";

const parse = () => ok(null);
const render = (s: SceneState) => <SceneView state={s} />;

/** Plays one boxes-and-arrows scene in the shared visualizer (principles, architecture, git). */
export function SceneViz({ scene }: { scene: Scene }) {
  const generate = useCallback(() => sceneSteps(scene), [scene]);
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
