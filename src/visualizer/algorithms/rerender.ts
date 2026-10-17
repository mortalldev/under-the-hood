import { splitParts } from "../core/parse";
import { recorder } from "../core/recorder";
import { fail, ok, type ParseResult } from "../core/types";

export const rerenderCode = `function Parent() {
  const [n, setN] = useState(0);       // setN(...) schedules a render of Parent
  return (
    <>
      <Child />                        {/* re-renders: React does not compare props by default */}
      <MemoChild label="x" />          {/* memo: shallow-equal props → bail out */}
    </>
  );
}
const MemoChild = memo(function MemoChild({ label }) { /* … */ });`;

export interface ComponentSpec {
  name: string;
  memo: boolean;
  /** Passes a freshly created object/function prop (breaks memo). */
  unstable: boolean;
  children: ComponentSpec[];
}

export interface RerenderInput {
  tree: ComponentSpec;
  trigger: string;
}

export interface RerenderState {
  tree: ComponentSpec;
  trigger: string;
  rendered: string[];
  skipped: string[];
  current: string | null;
}

/** Parses "App(Header, Main(List*, Sidebar!), Footer)"; * = memo, ! = gets an unstable prop. */
function parseComponentTree(raw: string): ParseResult<ComponentSpec> {
  let pos = 0;
  const s = raw.replace(/\s+/g, "");
  const seen = new Set<string>();
  const node = (): ComponentSpec => {
    const m = /^[A-Z]\w{0,11}/.exec(s.slice(pos));
    if (!m) throw new Error(`expected a component name at position ${pos + 1}`);
    pos += m[0].length;
    const spec: ComponentSpec = { name: m[0], memo: false, unstable: false, children: [] };
    if (seen.has(m[0])) throw new Error(`component names must be unique ("${m[0]}" repeats)`);
    seen.add(m[0]);
    if (seen.size > 12) throw new Error("at most 12 components");
    while (s[pos] === "*" || s[pos] === "!") {
      if (s[pos] === "*") spec.memo = true;
      else spec.unstable = true;
      pos++;
    }
    if (s[pos] === "(") {
      pos++;
      spec.children.push(node());
      while (s[pos] === ",") {
        pos++;
        spec.children.push(node());
      }
      if (s[pos] !== ")") throw new Error(`expected ")" at position ${pos + 1}`);
      pos++;
    }
    return spec;
  };
  try {
    const tree = node();
    if (pos !== s.length) throw new Error(`unexpected "${s[pos]}"`);
    return ok(tree);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return fail(`Tree syntax: Name(Child, Other*). ${msg}.`, `Daraxt sintaksisi: Name(Child, Other*). ${msg}.`);
  }
}

function findComponent(tree: ComponentSpec, name: string): ComponentSpec | null {
  if (tree.name === name) return tree;
  for (const c of tree.children) {
    const f = findComponent(c, name);
    if (f) return f;
  }
  return null;
}

export function parseRerender(raw: string): ParseResult<RerenderInput> {
  const parts = splitParts(raw, 2);
  if (!parts.ok) return parts;
  const tree = parseComponentTree(parts.value[0]);
  if (!tree.ok) return tree;
  if (!findComponent(tree.value, parts.value[1])) return fail(`"${parts.value[1]}" is not in the tree.`, `"${parts.value[1]}" daraxtda yoʻq.`);
  return ok({ tree: tree.value, trigger: parts.value[1] });
}

export function rerenderSteps({ tree, trigger }: RerenderInput) {
  const rec = recorder<RerenderState>();
  const st: RerenderState = { tree, trigger, rendered: [], skipped: [], current: null };
  const start = findComponent(tree, trigger) as ComponentSpec;
  rec.push(st, 2, `${trigger} calls setState. React schedules a render starting at ${trigger}. Its ancestors are NOT re-rendered — state updates flow down, never up.`, `${trigger} setState chaqiradi. React ${trigger} dan boshlab render rejalashtiradi. Uning ajdodlari re-render QILINMAYDI — state yangilanishi faqat pastga oqadi, hech qachon yuqoriga emas.`);

  const walk = (c: ComponentSpec, isRoot: boolean) => {
    st.current = c.name;
    if (!isRoot && c.memo && !c.unstable) {
      st.skipped.push(c.name);
      rec.push(st, 6, `${c.name} is wrapped in memo and its props are shallow-equal to last time → bail out. Its whole subtree is skipped too (unless something inside uses changed context or its own state).`, `${c.name} memo bilan oʻralgan va props'i oldingisiga shallow-equal → bail out. Uning butun subtree'si ham oʻtkazib yuboriladi (ichida oʻzgargan context yoki oʻz state'i boʻlmasa).`);
      return;
    }
    st.rendered.push(c.name);
    const why = isRoot
      ? { en: "its state changed", uz: "uning state'i oʻzgardi" }
      : c.memo
        ? { en: "it is memo, but receives a new object/function prop every render, so shallow comparison fails", uz: "u memo, lekin har render'da yangi object/function prop oladi, shuning uchun shallow taqqoslash muvaffaqiyatsiz" }
        : { en: "its parent rendered — by default React re-renders all children regardless of props", uz: "ota-komponenti render boʻldi — sukut boʻyicha React props'dan qat'i nazar barcha bolalarni re-render qiladi" };
    rec.push(st, isRoot ? 2 : 5, `Render ${c.name}: ${why.en}.`, `${c.name} render qilinadi: ${why.uz}.`);
    for (const child of c.children) walk(child, false);
  };
  walk(start, true);
  st.current = null;
  rec.push(st, 10, `Rendered ${st.rendered.length}, skipped ${st.skipped.length}. "Render" means calling the function and diffing its output; the commit phase then touches only DOM nodes whose output actually changed. A re-render with identical output is wasted CPU, not a DOM update.`, `${st.rendered.length} ta render qilindi, ${st.skipped.length} ta oʻtkazildi. "Render" — funksiyani chaqirib, natijasini diff qilish; commit phase faqat natijasi haqiqatan oʻzgargan DOM node'larga tegadi. Bir xil natijali re-render — DOM yangilanishi emas, behuda CPU.`);
  return rec.steps;
}
