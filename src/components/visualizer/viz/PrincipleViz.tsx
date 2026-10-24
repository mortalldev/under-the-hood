"use client";

import { scenes } from "@/visualizer/principles/scenes";
import { SceneViz } from "./SceneViz";

/** Step-through animation of one principle: `<PrincipleViz id="dry" />`. */
export function PrincipleViz({ id }: { id: string }) {
  const scene = scenes[id];
  if (!scene) throw new Error(`Unknown principle scene "${id}"`);
  return <SceneViz scene={scene} />;
}
