// End-to-end smoke test against a running server (default http://localhost:3000):
// every page and every registered lesson in both locales must return 200,
// render the expected <html lang>, contain no Next.js error markers, and
// lesson and library pages must contain their sections. Covers principles,
// architecture, git and tools pages too.
// Usage: npm run build && npm start, then in another shell: npm run smoke [-- http://host:port]
import { readFile } from "node:fs/promises";
import path from "node:path";

const base = (process.argv[2] ?? process.env.SMOKE_URL ?? "http://localhost:3000").replace(/\/$/, "");
const root = path.resolve(import.meta.dirname, "..");
const registrySrc = await readFile(path.join(root, "src/content/registry.ts"), "utf8");

const lessons = [];
const sections = [];
for (const m of registrySrc.matchAll(/^\s+"?([\w-]+)"?: rows\(\[([\s\S]*?)\n\s+\]\),/gm)) {
  sections.push(m[1]);
  for (const s of m[2].matchAll(/^\s+\["([\w-]+)",/gm)) lessons.push(`${m[1]}/${s[1]}`);
}

// Library pages (principles, architecture, git): `p("category", "slug", …)` rows.
const library = [];
for (const dir of ["principles", "architecture", "git"]) {
  const src = await readFile(path.join(root, "src/content", dir, "registry.ts"), "utf8");
  const cats = [...src.match(/categorySlugs = \[([^\]]*)\]/)[1].matchAll(/"([\w-]+)"/g)].map((m) => m[1]);
  library.push(`/${dir}`, ...cats.map((c) => `/${dir}/${c}`));
  for (const m of src.matchAll(/^\s+p\("([\w-]+)", "([\w-]+)",/gm)) library.push(`/${dir}/${m[1]}/${m[2]}`);
}
const toolsSrc = await readFile(path.join(root, "src/content/tools/registry.ts"), "utf8");
library.push("/tools", ...[...toolsSrc.match(/toolCategorySlugs = \[([^\]]*)\]/)[1].matchAll(/"([\w-]+)"/g)].map((m) => `/tools/${m[1]}`));

const pages = [];
for (const locale of ["uz", "en"]) {
  pages.push(`/${locale}`, `/${locale}/learn`, `/${locale}/review`, `/${locale}/resources`, `/${locale}/glossary`);
  for (const p of library) pages.push(`/${locale}${p}`);
  for (const s of sections) pages.push(`/${locale}/learn/${s}`);
  for (const l of lessons) pages.push(`/${locale}/learn/${l}`);
}

let failures = 0;
const check = async (url) => {
  const locale = url.split("/")[1];
  try {
    const res = await fetch(base + url, { redirect: "manual" });
    const html = await res.text();
    const problems = [];
    if (res.status !== 200) problems.push(`status ${res.status}`);
    if (!html.includes(`lang="${locale}"`)) problems.push(`missing lang="${locale}"`);
    if (/__next_error__|Application error|NEXT_HTTP_ERROR_FALLBACK;404/.test(html)) problems.push("error marker in HTML");
    // A lesson page must actually contain lesson content, not just a 200 shell.
    if (url.split("/")[2] === "learn" && url.split("/").length === 5 && (html.match(/<h2/g) ?? []).length < 5) problems.push("lesson body missing");
    if (["principles", "architecture", "git"].includes(url.split("/")[2]) && url.split("/").length === 5 && (html.match(/<h2/g) ?? []).length < 4) problems.push("page body missing");
    if (problems.length) {
      failures++;
      console.error("✗", url, problems.join(", "));
    }
  } catch (e) {
    failures++;
    console.error("✗", url, e.message);
  }
};

// Small concurrency pool keeps the server responsive.
const queue = [...pages];
await Promise.all(Array.from({ length: 6 }, async () => {
  while (queue.length) await check(queue.shift());
}));

// Unprefixed root should redirect to a locale.
const rootRes = await fetch(base + "/", { redirect: "manual" });
if (rootRes.status < 300 || rootRes.status >= 400) {
  failures++;
  console.error("✗ / should redirect to a locale, got", rootRes.status);
}

console.log(`${pages.length + 1} URLs checked, ${failures} failure(s).`);
process.exit(failures ? 1 : 0);
