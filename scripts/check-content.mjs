// Fast content checks without a full Next build:
// 1. every registered lesson has en.mdx and uz.mdx,
// 2. every MDX file compiles,
// 3. every <Term id="…"> exists in the glossary,
// 4. both locales of a lesson use the same components (same depth).
import { compile } from "@mdx-js/mdx";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import remarkGfm from "remark-gfm";

const root = path.resolve(import.meta.dirname, "..");
const lessonsDir = path.join(root, "src/content/lessons");
const glossarySrc = await readFile(path.join(root, "src/content/glossary.ts"), "utf8");
const glossaryIds = new Set([...glossarySrc.matchAll(/^\s+"?([\w-]+)"?: g\(/gm)].map((m) => m[1]));
const registrySrc = await readFile(path.join(root, "src/content/registry.ts"), "utf8");

let failures = 0;
const fail = (msg) => {
  failures++;
  console.error("✗", msg);
};

// Registered lessons: parse `section: rows([ ["slug", …` blocks.
const registered = [];
for (const m of registrySrc.matchAll(/^\s+"?([\w-]+)"?: rows\(\[([\s\S]*?)\n\s+\]\),/gm)) {
  for (const s of m[2].matchAll(/^\s+\["([\w-]+)",/gm)) registered.push(`${m[1]}/${s[1]}`);
}

const components = (src) =>
  [...src.matchAll(/<([A-Z]\w+)/g)]
    .map((m) => m[1])
    .sort()
    .join(",");

for (const id of registered) {
  const sources = {};
  for (const locale of ["en", "uz"]) {
    const file = path.join(lessonsDir, id, `${locale}.mdx`);
    let src;
    try {
      src = await readFile(file, "utf8");
    } catch {
      fail(`${id}: missing ${locale}.mdx`);
      continue;
    }
    sources[locale] = src;
    try {
      await compile(src, { remarkPlugins: [remarkGfm] });
    } catch (e) {
      fail(`${id}/${locale}.mdx: ${e.message}`);
    }
    for (const m of src.matchAll(/<Term id="([^"]+)"/g)) {
      if (!glossaryIds.has(m[1])) fail(`${id}/${locale}.mdx: unknown glossary id "${m[1]}"`);
    }
  }
  if (sources.en && sources.uz && components(sources.en) !== components(sources.uz)) {
    fail(`${id}: en/uz use different components\n  en: ${components(sources.en)}\n  uz: ${components(sources.uz)}`);
  }
}

const onDisk = [];
for (const section of await readdir(lessonsDir)) {
  for (const lesson of await readdir(path.join(lessonsDir, section))) onDisk.push(`${section}/${lesson}`);
}
for (const id of onDisk) if (!registered.includes(id)) fail(`${id}: on disk but not in registry.ts`);

console.log(`${registered.length} lessons checked, ${failures} problem(s).`);
process.exit(failures ? 1 : 0);
