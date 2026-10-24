"use client";

import { scenes } from "@/visualizer/architecture/scenes";
import { SceneViz } from "./SceneViz";

/** Step-through animation of one architecture topic: `<ArchitectureViz id="cqrs" />`. */
export function ArchitectureViz({ id }: { id: string }) {
  const scene = scenes[id];
  if (!scene) throw new Error(`Unknown architecture scene "${id}"`);
  return <SceneViz scene={scene} />;
}
