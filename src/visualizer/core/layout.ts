export interface Point {
  x: number;
  y: number;
}

/** Places nodes evenly on a circle inside a 100×60 viewBox. */
export function circleLayout(ids: readonly string[]): Record<string, Point> {
  const out: Record<string, Point> = {};
  const n = ids.length;
  ids.forEach((id, i) => {
    const angle = -Math.PI / 2 + (2 * Math.PI * i) / Math.max(n, 1);
    out[id] = { x: 50 + 38 * Math.cos(angle), y: 30 + 23 * Math.sin(angle) };
  });
  return out;
}

/**
 * Tidy-enough layout for a rooted tree: leaves get consecutive x slots, parents
 * are centered over their children. Coordinates fit a 100×60 viewBox.
 */
export function treeLayout(
  root: string,
  children: (id: string) => readonly string[],
): Record<string, Point> {
  const depth: Record<string, number> = {};
  const slot: Record<string, number> = {};
  let nextLeaf = 0;
  let maxDepth = 0;

  const visit = (id: string, d: number): number => {
    depth[id] = d;
    maxDepth = Math.max(maxDepth, d);
    const kids = children(id);
    if (kids.length === 0) {
      slot[id] = nextLeaf++;
      return slot[id];
    }
    const xs = kids.map((k) => visit(k, d + 1));
    slot[id] = (xs[0] + xs[xs.length - 1]) / 2;
    return slot[id];
  };
  visit(root, 0);

  const width = Math.max(nextLeaf - 1, 1);
  const out: Record<string, Point> = {};
  for (const id of Object.keys(slot)) {
    out[id] = {
      x: nextLeaf === 1 ? 50 : 6 + (88 * slot[id]) / width,
      y: maxDepth === 0 ? 30 : 6 + (48 * depth[id]) / maxDepth,
    };
  }
  return out;
}

/** Positions for a binary tree stored level-order in an array (heap layout). */
export function heapLayout(size: number): Point[] {
  const levels = Math.max(1, Math.ceil(Math.log2(size + 1)));
  return Array.from({ length: size }, (_, i) => {
    const level = Math.floor(Math.log2(i + 1));
    const indexInLevel = i - (2 ** level - 1);
    const slots = 2 ** level;
    return {
      x: (100 * (indexInLevel + 0.5)) / slots,
      y: levels === 1 ? 30 : 7 + (46 * level) / (levels - 1),
    };
  });
}
