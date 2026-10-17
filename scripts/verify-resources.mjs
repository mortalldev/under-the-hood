// Re-checks every URL in resources.json. Exits non-zero if any link fails.
// Some hosts block non-browser clients (HTTP 403); those are reported
// separately so a human can confirm them before lastVerified is bumped.
import { readFile } from "node:fs/promises";

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0 Safari/537.36";
const { resources } = JSON.parse(await readFile(new URL("../resources.json", import.meta.url), "utf8"));

const results = await Promise.all(
  resources.map(async (r) => {
    try {
      const res = await fetch(r.url, { redirect: "follow", headers: { "user-agent": UA }, signal: AbortSignal.timeout(20_000) });
      return { r, status: res.status };
    } catch (e) {
      return { r, status: 0, error: String(e) };
    }
  }),
);

const failed = results.filter((x) => x.status !== 200 && x.status !== 403);
const blocked = results.filter((x) => x.status === 403);
for (const x of blocked) console.warn(`403 (bot-blocked, verify by hand)  ${x.r.id}  ${x.r.url}`);
for (const x of failed) console.error(`${x.status || "ERR"}  ${x.r.id}  ${x.r.url}${x.error ? `  ${x.error}` : ""}`);
console.log(`${results.length - failed.length - blocked.length}/${results.length} OK`);
process.exit(failed.length ? 1 : 0);
