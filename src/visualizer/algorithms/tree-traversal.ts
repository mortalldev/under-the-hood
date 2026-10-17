import { recorder } from "../core/recorder";
import { fail, ok, type ParseResult } from "../core/types";

export type TraversalMode = "bfs" | "preorder" | "inorder" | "postorder";

export interface BinaryTree {
  root: number | null;
  val: number[];
  left: (number | null)[];
  right: (number | null)[];
}

/** LeetCode-style level order: "1,2,3,null,4". */
export function parseBinaryTree(raw: string): ParseResult<BinaryTree> {
  const tokens = raw.split(/[\s,]+/).filter(Boolean);
  if (tokens.length === 0 || tokens.length > 20) return fail("Give 1–20 level-order values (use null for gaps).", "1–20 ta level-order qiymat kiriting (boʻshliq uchun null).");
  const vals: (number | null)[] = [];
  for (const t of tokens) {
    if (t === "null" || t === "#") vals.push(null);
    else if (/^-?\d{1,3}$/.test(t)) vals.push(Number(t));
    else return fail(`"${t}" is not a number or null.`, `"${t}" son ham, null ham emas.`);
  }
  const tree: BinaryTree = { root: null, val: [], left: [], right: [] };
  if (vals[0] === null) return ok(tree);
  const make = (v: number) => {
    tree.val.push(v);
    tree.left.push(null);
    tree.right.push(null);
    return tree.val.length - 1;
  };
  tree.root = make(vals[0]);
  const queue = [tree.root];
  let k = 1;
  for (let h = 0; h < queue.length && k < vals.length; h++) {
    const node = queue[h];
    for (const side of ["left", "right"] as const) {
      if (k >= vals.length) break;
      const v = vals[k++];
      if (v !== null) {
        const id = make(v);
        tree[side][node] = id;
        queue.push(id);
      }
    }
  }
  if (tree.val.length > 15) return fail("At most 15 nodes.", "Koʻpi bilan 15 ta node.");
  return ok(tree);
}

const visitLine: Record<Exclude<TraversalMode, "bfs">, number> = { preorder: 3, inorder: 4, postorder: 5 };

export function traversalCode(mode: TraversalMode): string {
  if (mode === "bfs") {
    return `function levelOrder(root: TreeNode | null): number[] {
  const out: number[] = [];
  const queue = root ? [root] : [];
  for (let head = 0; head < queue.length; head++) {
    const node = queue[head];
    out.push(node.val);
    if (node.left) queue.push(node.left);
    if (node.right) queue.push(node.right);
  }
  return out;
}`;
  }
  const body = {
    preorder: ["out.push(node.val);       // visit BEFORE children", "walk(node.left);", "walk(node.right);"],
    inorder: ["walk(node.left);", "out.push(node.val);       // visit BETWEEN children", "walk(node.right);"],
    postorder: ["walk(node.left);", "walk(node.right);", "out.push(node.val);       // visit AFTER children"],
  }[mode];
  return `function walk(node: TreeNode | null): void {
  if (!node) return;           // base case
  ${body[0]}
  ${body[1]}
  ${body[2]}
}`;
}

export interface TreeTraversalState {
  tree: BinaryTree;
  current: number | null;
  out: number[];
  /** Node ids in output order (values may repeat, ids do not). */
  visited: number[];
  queue: number[];
  frames: { id: number; node: number | null }[];
}

export function treeTraversalSteps(tree: BinaryTree, mode: TraversalMode) {
  const rec = recorder<TreeTraversalState>();
  const st: TreeTraversalState = { tree, current: null, out: [], visited: [], queue: [], frames: [] };
  if (tree.root === null) {
    rec.push(st, 2, "Empty tree: nothing to visit.", "Boʻsh daraxt: tashrif buyuradigan narsa yoʻq.");
    return rec.steps;
  }

  if (mode === "bfs") {
    st.queue = [tree.root];
    rec.push(st, 3, `Queue starts with the root. BFS = level by level.`, `Queue root bilan boshlanadi. BFS = daraja-daraja.`);
    while (st.queue.length) {
      const n = st.queue.shift() as number;
      st.current = n;
      st.out.push(tree.val[n]);
      st.visited.push(n);
      rec.push(st, 6, `Dequeue ${tree.val[n]} and visit it.`, `${tree.val[n]} queue'dan olinib, tashrif buyuriladi.`);
      const kids = [tree.left[n], tree.right[n]].filter((c): c is number => c !== null);
      if (kids.length) {
        st.queue.push(...kids);
        rec.push(st, 8, `Enqueue its children ${kids.map((c) => tree.val[c]).join(", ")} — they wait behind everything already on this level.`, `Uning bolalari ${kids.map((c) => tree.val[c]).join(", ")} queue'ga qoʻshiladi — ular shu darajadagi barcha node'lar ortida kutadi.`);
      }
    }
    st.current = null;
    rec.push(st, 10, `Level order: ${st.out.join(", ")}. O(n) time; the queue holds up to one full level (≈ n/2 for a complete tree).`, `Level order: ${st.out.join(", ")}. O(n) vaqt; queue bir toʻliq darajagacha saqlaydi (toʻliq daraxtda ≈ n/2).`);
    return rec.steps;
  }

  let frameId = 0;
  const vLine = visitLine[mode];
  const walk = (n: number | null) => {
    st.frames.push({ id: frameId++, node: n });
    st.current = n;
    if (n === null) {
      rec.push(st, 2, `walk(null): base case, return immediately.`, `walk(null): base case, darhol qaytadi.`);
      st.frames.pop();
      st.current = st.frames[st.frames.length - 1]?.node ?? null;
      return;
    }
    rec.push(st, 2, `Enter walk(${tree.val[n]}). Stack depth ${st.frames.length} = depth of this node + 1.`, `walk(${tree.val[n]}) ga kirildi. Stack chuqurligi ${st.frames.length} = node chuqurligi + 1.`);
    const visit = () => {
      st.current = n;
      st.out.push(tree.val[n]);
      st.visited.push(n);
      rec.push(st, vLine, `Visit ${tree.val[n]} → output [${st.out.join(", ")}].`, `${tree.val[n]} ga tashrif → output [${st.out.join(", ")}].`);
    };
    if (mode === "preorder") visit();
    walk(tree.left[n]);
    st.current = n;
    if (mode === "inorder") visit();
    walk(tree.right[n]);
    st.current = n;
    if (mode === "postorder") visit();
    st.frames.pop();
    st.current = st.frames[st.frames.length - 1]?.node ?? null;
  };
  walk(tree.root);
  const extra =
    mode === "inorder"
      ? { en: " For a BST this is sorted order.", uz: " BST uchun bu saralangan tartib." }
      : mode === "postorder"
        ? { en: " Children before parent: used to free/delete trees and compute subtree values.", uz: " Bolalar otadan oldin: daraxtni oʻchirish va subtree qiymatlarini hisoblashda ishlatiladi." }
        : { en: " Parent before children: used to copy/serialize a tree.", uz: " Ota bolalardan oldin: daraxtni nusxalash/serialize qilishda ishlatiladi." };
  rec.push(st, 6, `${mode}: ${st.out.join(", ")}. O(n) time, O(h) stack.${extra.en}`, `${mode}: ${st.out.join(", ")}. O(n) vaqt, O(h) stack.${extra.uz}`);
  return rec.steps;
}

export function traverseReference(tree: BinaryTree, mode: TraversalMode): number[] {
  const out: number[] = [];
  if (tree.root === null) return out;
  if (mode === "bfs") {
    const q = [tree.root];
    for (let h = 0; h < q.length; h++) {
      out.push(tree.val[q[h]]);
      for (const c of [tree.left[q[h]], tree.right[q[h]]]) if (c !== null) q.push(c);
    }
    return out;
  }
  const rec = (n: number | null) => {
    if (n === null) return;
    if (mode === "preorder") out.push(tree.val[n]);
    rec(tree.left[n]);
    if (mode === "inorder") out.push(tree.val[n]);
    rec(tree.right[n]);
    if (mode === "postorder") out.push(tree.val[n]);
  };
  rec(tree.root);
  return out;
}
