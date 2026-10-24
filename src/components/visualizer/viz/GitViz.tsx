"use client";

import { scenes } from "@/visualizer/git/scenes";
import { SceneViz } from "./SceneViz";

/** Commit-graph animation of one git topic: `<GitViz id="rebase" />`. */
export function GitViz({ id }: { id: string }) {
  const scene = scenes[id];
  if (!scene) throw new Error(`Unknown git scene "${id}"`);
  return <SceneViz scene={scene} />;
}
