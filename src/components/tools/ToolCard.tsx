import { getTranslations } from "next-intl/server";
import type { Tool } from "@/content/tools/registry";
import type { Locale } from "@/i18n/routing";

const host = (url: string) => new URL(url).host.replace(/^www\./, "");

/** Build, lint and test tools are dev dependencies; full commands (npx …) are shown as written. */
const installLine = (install: string, category: Tool["category"]) =>
  /^(npx|npm|pnpm) /.test(install) ? install : `npm i ${["quality", "testing", "monorepo"].includes(category) ? "-D " : ""}${install}`;

/** One tool: what it is, when to use it and when not, how to install it, and its official docs. */
export async function ToolCard({ tool, locale, pick = false }: { tool: Tool; locale: Locale; pick?: boolean }) {
  const t = await getTranslations("Tools");
  return (
    <article id={tool.slug} className="flex h-full min-w-0 scroll-mt-24 flex-col rounded-2xl border border-border bg-surface-1 p-5">
      <header className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <h3 className="text-lg font-semibold">{tool.name}</h3>
        {pick && <span className="rounded-full bg-accent-soft px-2.5 py-0.5 text-[0.7rem] font-semibold text-accent">{t("pick")}</span>}
        {tool.by && (
          <span className="ml-auto text-xs text-fg-subtle">
            {t("by")} {tool.by}
          </span>
        )}
      </header>
      <p className="mt-2 text-[0.94rem] leading-relaxed text-fg-muted">{tool.what[locale]}</p>

      <dl className="mt-4 grid gap-3 text-[0.9rem] leading-relaxed">
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/6 px-3.5 py-2.5">
          <dt className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">✓ {t("use")}</dt>
          <dd className="mt-1">{tool.use[locale]}</dd>
        </div>
        <div className="rounded-xl border border-rose-500/25 bg-rose-500/5 px-3.5 py-2.5">
          <dt className="text-xs font-semibold text-rose-700 dark:text-rose-300">✕ {t("avoid")}</dt>
          <dd className="mt-1">{tool.avoid[locale]}</dd>
        </div>
      </dl>

      <div className="mt-auto pt-4">
        {tool.install && (
          <p className="mb-3">
            <span className="sr-only">{t("install")}: </span>
            <code className="block overflow-x-auto rounded-lg bg-code-bg px-3 py-2 font-mono text-[0.78rem] whitespace-nowrap">
              {installLine(tool.install, tool.category)}
            </code>
          </p>
        )}
        <a
          href={tool.docs}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-border bg-bg px-3 text-sm font-medium transition-colors hover:border-accent/50 hover:text-accent"
        >
          {t("docs")}
          <span className="font-mono text-xs text-fg-subtle">{host(tool.docs)}</span>
          <span aria-hidden="true">↗</span>
        </a>
      </div>
    </article>
  );
}
