import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { IntentLink } from "@/components/layout/IntentLink";
import { CategoryGrid } from "@/components/library/CategoryGrid";
import { categories, cheatSheet, gitLib, topics, type CheatRow } from "@/content/git/registry";
import { entryBySlug, entryHref } from "@/content/library";
import type { Locale } from "@/i18n/routing";
import { jsonLd, pageMetadata } from "@/lib/seo";
import { site } from "@/lib/site";

export async function generateMetadata(): Promise<Metadata> {
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("Git");
  return pageMetadata({ locale, path: "/git", title: t("title"), description: t("lead") });
}

const safetyClass: Record<CheatRow["safety"], string> = {
  safe: "bg-emerald-500/12 text-emerald-700 dark:text-emerald-300",
  local: "bg-sky-500/12 text-sky-700 dark:text-sky-300",
  unsafe: "bg-amber-500/14 text-amber-800 dark:text-amber-300",
};

export default async function GitPage() {
  const [t, locale] = await Promise.all([getTranslations("Git"), getLocale() as Promise<Locale>]);

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "DefinedTermSet",
    name: t("title"),
    url: `${site.url}/${locale}/git`,
    inLanguage: locale,
    hasDefinedTerm: topics.map((p) => ({
      "@type": "DefinedTerm",
      name: p.name,
      description: p.tagline[locale],
      url: `${site.url}/${locale}${entryHref(gitLib, p)}`,
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(structuredData) }} />

      <header className="max-w-3xl">
        <p className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-1 px-3 py-1 text-xs font-medium text-fg-muted">
          <span aria-hidden="true" className="size-1.5 rounded-full bg-accent" />
          {t("stats", { entries: topics.length, categories: categories.length })}
        </p>
        <h1 className="mt-5 text-[1.8rem] leading-[1.15] font-semibold tracking-tight text-balance sm:text-[2.4rem]">{t("title")}</h1>
        <p className="mt-4 text-base leading-relaxed text-fg-muted sm:text-[1.0625rem]">{t("lead")}</p>
        <IntentLink
          href="/git/basics/object-model"
          className="mt-6 inline-flex min-h-12 items-center gap-2 rounded-xl bg-accent px-5 text-[0.95rem] font-semibold text-accent-fg transition-opacity hover:opacity-90"
        >
          {t("start")}
          <span aria-hidden="true">→</span>
        </IntentLink>
      </header>

      <section aria-labelledby="cheat" className="mt-12">
        <h2 id="cheat" className="text-xl font-semibold">
          {t("cheatTitle")}
        </h2>
        <p className="mt-1.5 max-w-2xl text-[0.95rem] leading-relaxed text-fg-muted">{t("cheatLead")}</p>
        <p className="mt-3 flex flex-wrap gap-2 text-xs">
          {(["safe", "local", "unsafe"] as const).map((s) => (
            <span key={s} className={`rounded-full px-2.5 py-1 font-medium ${safetyClass[s]}`}>
              {t(s)}
            </span>
          ))}
        </p>
        <div className="mt-5 grid gap-4 xl:grid-cols-2">
          {cheatSheet.map((g) => (
            <section key={g.group.en} className="min-w-0 overflow-hidden rounded-2xl border border-border bg-surface-1">
              <h3 className="border-b border-border px-4 py-2.5 text-sm font-semibold">{g.group[locale]}</h3>
              <ul className="divide-y divide-border">
                {g.rows.map((r) => {
                  const topic = entryBySlug(gitLib, r.topic)!;
                  return (
                    <li key={r.cmd}>
                      <IntentLink href={entryHref(gitLib, topic)} className="group block px-4 py-2.5 transition-colors hover:bg-bg">
                        <span className="flex items-start justify-between gap-3">
                          <span className="text-[0.9rem] leading-snug group-hover:text-accent">{r.task[locale]}</span>
                          <span className={`shrink-0 rounded-full px-2 py-0.5 text-[0.65rem] font-semibold ${safetyClass[r.safety]}`}>{t(r.safety)}</span>
                        </span>
                        <code className="mt-1.5 block overflow-x-auto rounded-md bg-code-bg px-2.5 py-1.5 font-mono text-[0.78rem] whitespace-nowrap text-fg">{r.cmd}</code>
                      </IntentLink>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      </section>

      <h2 className="mt-14 text-xl font-semibold">{t("categories")}</h2>
      <CategoryGrid lib={gitLib} locale={locale} numbered />
    </>
  );
}
