// Fast content checks without a full Next build:
// 1. every registered lesson has en.mdx and uz.mdx,
// 2. every MDX file compiles,
// 3. every <Term id="…"> exists in the glossary,
// 4. both locales of a lesson use the same components (same depth),
// 5. the same for every library page (principles, architecture, git), whose
//    <PrincipleViz|ArchitectureViz|GitViz id> must be its own slug, and every tools page.
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

// Libraries (principles, architecture, git): `p("category", "slug", …)` rows in
// <dir>/registry.ts; each page's <Viz id> must be its own slug.
const libraries = [
  { dir: "principles", viz: "PrincipleViz" },
  { dir: "architecture", viz: "ArchitectureViz" },
  { dir: "git", viz: "GitViz" },
];
const checkPage = async (label, file, sources, locale, rules = () => {}) => {
  let src;
  try {
    src = await readFile(file, "utf8");
  } catch {
    fail(`${label}: missing ${locale}.mdx`);
    return;
  }
  sources[locale] = src;
  try {
    await compile(src, { remarkPlugins: [remarkGfm] });
  } catch (e) {
    fail(`${label}/${locale}.mdx: ${e.message}`);
  }
  for (const m of src.matchAll(/<Term id="([^"]+)"/g)) {
    if (!glossaryIds.has(m[1])) fail(`${label}/${locale}.mdx: unknown glossary id "${m[1]}"`);
  }
  rules(src);
};
const sameDepth = (label, sources) => {
  if (sources.en && sources.uz && components(sources.en) !== components(sources.uz)) {
    fail(`${label}: en/uz use different components
  en: ${components(sources.en)}
  uz: ${components(sources.uz)}`);
  }
};

let entryCount = 0;
for (const { dir, viz } of libraries) {
  const libDir = path.join(root, "src/content", dir);
  const src = await readFile(path.join(libDir, "registry.ts"), "utf8");
  const slugs = [...src.matchAll(/^\s+p\("[\w-]+", "([\w-]+)",/gm)].map((m) => m[1]);
  entryCount += slugs.length;
  for (const slug of slugs) {
    const sources = {};
    for (const locale of ["en", "uz"]) {
      await checkPage(`${dir}/${slug}`, path.join(libDir, slug, `${locale}.mdx`), sources, locale, (text) => {
        const ids = [...text.matchAll(new RegExp(`<${viz} id="([^"]+)"`, "g"))].map((m) => m[1]);
        if (ids.length === 0) fail(`${dir}/${slug}/${locale}.mdx: no <${viz}>`);
        for (const id of ids) if (id !== slug) fail(`${dir}/${slug}/${locale}.mdx: ${viz} id "${id}" is not this page's slug`);
      });
    }
    sameDepth(`${dir}/${slug}`, sources);
  }
  for (const d of await readdir(libDir, { withFileTypes: true })) {
    if (d.isDirectory() && !slugs.includes(d.name)) fail(`${dir}/${d.name}: on disk but not in ${dir}/registry.ts`);
  }
}

// Tools: one MDX page per category in tools/registry.ts.
const toolsDir = path.join(root, "src/content/tools");
const toolsSrc = await readFile(path.join(toolsDir, "registry.ts"), "utf8");
const toolCats = [...toolsSrc.match(/toolCategorySlugs = \[([\s\S]*?)\]/)[1].matchAll(/"([\w-]+)"/g)].map((m) => m[1]);
for (const cat of toolCats) {
  const sources = {};
  for (const locale of ["en", "uz"]) await checkPage(`tools/${cat}`, path.join(toolsDir, cat, `${locale}.mdx`), sources, locale);
  sameDepth(`tools/${cat}`, sources);
}
for (const d of await readdir(toolsDir, { withFileTypes: true })) {
  if (d.isDirectory() && !toolCats.includes(d.name)) fail(`tools/${d.name}: on disk but not a tools category`);
}

console.log(`${registered.length} lessons, ${entryCount} library pages and ${toolCats.length} tool pages checked, ${failures} problem(s).`);
process.exit(failures ? 1 : 0);
