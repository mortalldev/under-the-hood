import type { Localized, Step, Tone } from "../core/types";

/**
 * Principle animations are "scenes": a fixed cast of boxes (classes, modules,
 * functions…) and arrows between them, played as a list of frames. Each frame
 * only describes what changes, so a scene reads like a storyboard. The output
 * is the same Step<S>[] the algorithm visualizers use, so the shared player
 * (play/step/scrub, code-line highlight) drives it unchanged.
 */

export type Text = string | Localized;

export interface SceneNodeDef {
  label: Text;
  /** Second line in mono: a method list, a type, a value. */
  sub?: Text;
  /** Centre, in the scene's coordinate space (default 640 × 300). */
  x: number;
  y: number;
  w?: number;
  h?: number;
  /** interface: dashed outline + «interface» tag; data: pill; note: borderless text. */
  kind?: "box" | "interface" | "data" | "note";
}

export interface EdgeOpts {
  tone?: Tone;
  dashed?: boolean;
  label?: Text;
  /** A dot travels along the arrow: a call or data flowing. */
  flow?: boolean;
}

export type EdgeSpec = [from: string, to: string] | [from: string, to: string, opts: EdgeOpts];

export interface Frame {
  add?: string[];
  remove?: string[];
  /** Merged into the current tones; "default" resets one. */
  tone?: Record<string, Tone>;
  at?: Record<string, [number, number]>;
  /** Replaces all arrows. */
  edges?: EdgeSpec[];
  addEdges?: EdgeSpec[];
  /** "from>to" keys of arrows to drop. */
  dropEdges?: string[];
  /** Merged; "" removes a badge. */
  badge?: Record<string, Text>;
  /** Relabel a node from this frame on. */
  relabel?: Record<string, { label?: Text; sub?: Text }>;
  verdict?: "bad" | "good" | null;
  line?: number;
  note: Localized;
}

export interface Scene {
  title: Localized;
  code: string;
  width?: number;
  height?: number;
  nodes: Record<string, SceneNodeDef>;
  frames: Frame[];
}

export interface SceneNode extends SceneNodeDef {
  id: string;
  tone: Tone;
  badge?: Text;
}

export interface SceneEdge extends EdgeOpts {
  from: string;
  to: string;
}

export interface SceneState {
  width: number;
  height: number;
  nodes: SceneNode[];
  edges: SceneEdge[];
  verdict: "bad" | "good" | null;
}

/** Localized text shorthand for scene authoring: L("English", "Oʻzbekcha"). */
export const L = (en: string, uz: string): Localized => ({ en, uz });

const toEdge =([from, to, opts]: EdgeSpec): SceneEdge => ({ from, to, ...opts });

/** Expands a scene's delta frames into full snapshots. */
export function sceneSteps(scene: Scene): Step<SceneState>[] {
  const width = scene.width ?? 640;
  const height = scene.height ?? 300;
  const visible: string[] = [];
  const tones: Record<string, Tone> = {};
  const badges: Record<string, Text> = {};
  const pos: Record<string, [number, number]> = {};
  const labels: Record<string, { label?: Text; sub?: Text }> = {};
  let edges: SceneEdge[] = [];
  let verdict: SceneState["verdict"] = null;

  return scene.frames.map((f) => {
    for (const id of f.remove ?? []) {
      const i = visible.indexOf(id);
      if (i >= 0) visible.splice(i, 1);
    }
    for (const id of f.add ?? []) if (!visible.includes(id)) visible.push(id);
    Object.assign(tones, f.tone);
    Object.assign(pos, f.at);
    for (const [id, text] of Object.entries(f.relabel ?? {})) labels[id] = { ...labels[id], ...text };
    for (const [id, text] of Object.entries(f.badge ?? {})) {
      if (text) badges[id] = text;
      else delete badges[id];
    }
    if (f.edges) edges = f.edges.map(toEdge);
    if (f.dropEdges) edges = edges.filter((e) => !f.dropEdges!.includes(`${e.from}>${e.to}`));
    if (f.addEdges) edges = [...edges, ...f.addEdges.map(toEdge)];
    if (f.verdict !== undefined) verdict = f.verdict;

    const nodes = visible.map((id): SceneNode => {
      const def = scene.nodes[id];
      const [x, y] = pos[id] ?? [def.x, def.y];
      return { ...def, ...labels[id], id, x, y, tone: tones[id] ?? "default", badge: badges[id] };
    });
    const shown = new Set(visible);
    return {
      state: { width, height, nodes, edges: edges.filter((e) => shown.has(e.from) && shown.has(e.to)), verdict },
      line: f.line,
      note: f.note,
    };
  });
}
