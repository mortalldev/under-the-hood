import { splitParts } from "../core/parse";
import { recorder } from "../core/recorder";
import { fail, ok, type ParseResult } from "../core/types";

export const trieCode = `class TrieNode {
  children = new Map<string, TrieNode>();
  end = false;                       // a word ends here
}
function insert(root: TrieNode, word: string) {
  let node = root;
  for (const ch of word) {
    if (!node.children.has(ch)) node.children.set(ch, new TrieNode());
    node = node.children.get(ch)!;
  }
  node.end = true;
}
function startsWith(root: TrieNode, prefix: string): boolean {
  let node = root;
  for (const ch of prefix) {
    const next = node.children.get(ch);
    if (!next) return false;         // path breaks: no word has this prefix
    node = next;
  }
  return true;                       // O(prefix length), independent of word count
}`;

export interface TrieInput {
  words: string[];
  query: string;
}

export interface TrieNodeState {
  id: string;
  ch: string;
  children: string[];
  end: boolean;
}

export interface TrieState {
  nodes: TrieNodeState[];
  current: string | null;
  path: string[];
  phase: "insert" | "search" | "done";
  word: string;
  found: boolean | null;
  created: string | null;
}

export function parseTrie(raw: string): ParseResult<TrieInput> {
  const parts = splitParts(raw, 2);
  if (!parts.ok) return parts;
  const words = parts.value[0].split(",").map((w) => w.trim().toLowerCase()).filter(Boolean);
  if (words.length < 1 || words.length > 6) return fail("Give 1–6 words.", "1–6 ta soʻz kiriting.");
  if (words.some((w) => !/^[a-z]{1,6}$/.test(w))) return fail("Words: a–z only, up to 6 letters.", "Soʻzlar: faqat a–z, 6 harfgacha.");
  const query = parts.value[1].toLowerCase();
  if (!/^[a-z]{1,6}$/.test(query)) return fail("Query: a–z only, up to 6 letters.", "Soʻrov: faqat a–z, 6 harfgacha.");
  return ok({ words, query });
}

export function trieSteps({ words, query }: TrieInput) {
  const rec = recorder<TrieState>();
  const st: TrieState = {
    nodes: [{ id: "root", ch: "•", children: [], end: false }],
    current: "root",
    path: ["root"],
    phase: "insert",
    word: "",
    found: null,
    created: null,
  };
  const get = (id: string) => st.nodes.find((n) => n.id === id) as TrieNodeState;
  const childOf = (id: string, ch: string) => get(id).children.find((c) => get(c).ch === ch);

  rec.push(st, 1, `An empty trie is a single root. Each edge is a character; a path from the root spells a prefix.`, `Boʻsh trie — bitta root. Har bir edge — belgi; root'dan boshlangan yoʻl prefix'ni hosil qiladi.`);

  for (const word of words) {
    st.word = word;
    st.current = "root";
    st.path = ["root"];
    for (const ch of word) {
      let next = childOf(st.current, ch);
      st.created = null;
      if (!next) {
        next = `${st.current}/${ch}`;
        st.nodes.push({ id: next, ch, children: [], end: false });
        get(st.current).children.push(next);
        st.created = next;
        rec.push(st, 8, `insert("${word}"): no '${ch}' edge yet — create a node.`, `insert("${word}"): '${ch}' edge hali yoʻq — yangi node yaratiladi.`);
      } else {
        rec.push(st, 8, `insert("${word}"): '${ch}' already exists — the prefix is shared, no new memory.`, `insert("${word}"): '${ch}' allaqachon bor — prefix umumiy, yangi xotira kerak emas.`);
      }
      st.current = next;
      st.path.push(next);
    }
    get(st.current).end = true;
    st.created = null;
    rec.push(st, 11, `Mark the last node of "${word}" as end-of-word. Without this flag "car" would look present once "cart" is inserted.`, `"${word}" ning oxirgi node'i end-of-word deb belgilanadi. Bu flag'siz "cart" qoʻshilgach, "car" ham bordek koʻrinadi.`);
  }

  st.phase = "search";
  st.word = query;
  st.current = "root";
  st.path = ["root"];
  rec.push(st, 14, `startsWith("${query}"): walk from the root, one character at a time.`, `startsWith("${query}"): root'dan boshlab har safar bitta belgi boʻyicha yuramiz.`);
  for (const ch of query) {
    const next = childOf(st.current, ch);
    if (!next) {
      st.found = false;
      st.phase = "done";
      rec.push(st, 17, `No '${ch}' edge — no inserted word starts with "${query}".`, `'${ch}' edge yoʻq — hech bir soʻz "${query}" bilan boshlanmaydi.`);
      return rec.steps;
    }
    st.current = next;
    st.path.push(next);
    rec.push(st, 18, `Follow '${ch}'.`, `'${ch}' boʻyicha oʻtamiz.`);
  }
  st.found = true;
  st.phase = "done";
  const isWord = get(st.current).end;
  rec.push(st, 20, `Prefix "${query}" exists${isWord ? ` and is itself a word (end flag set)` : ` (but is not a whole word: end flag is false)`}.`, `"${query}" prefix mavjud${isWord ? ` va oʻzi ham soʻz (end flag oʻrnatilgan)` : ` (lekin toʻliq soʻz emas: end flag false)`}.`);
  return rec.steps;
}
