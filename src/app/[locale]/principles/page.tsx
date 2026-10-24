import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { IntentLink } from "@/components/layout/IntentLink";
import { entriesIn, hueClass } from "@/content/library";
import { categories, principles, principlesLib } from "@/content/principles/registry";
import type { Locale } from "@/i18n/routing";
import { jsonLd, pageMetadata } from "@/lib/seo";
import { site } from "@/lib/site";

export async function generateMetadata(): Promise<Metadata> {
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("Principles");
  return pageMetadata({ locale, path: "/principles", title: t("title"), description: t("lead") });
}

export default async function PrinciplesPage() {
  const [t, locale] = await Promise.all([getTranslations("Principles"), getLocale() as Promise<Locale>]);
  const [solid, ...rest] = categories;

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "DefinedTermSet",
    name: t("title"),
    url: `${site.url}/${locale}/principles`,
    inLanguage: locale,
    hasDefinedTerm: principles.map((p) => ({
      "@type": "DefinedTerm",
      name: p.name,
      description: p.tagline[locale],
      url: `${site.url}/${locale}/principles/${p.category}/${p.slug}`,
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(structuredData) }} />

      <header className="max-w-3xl">
        <p className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-1 px-3 py-1 text-xs font-medium text-fg-muted">
          <span aria-hidden="true" className="size-1.5 rounded-full bg-accent" />
          {t("stats", { principles: principles.length, categories: categories.length })}
        </p>
        <h1 className="mt-5 text-[1.8rem] leading-[1.15] font-semibold tracking-tight text-balance sm:text-[2.4rem]">{t("title")}</h1>
        <p className="mt-4 text-base leading-relaxed text-fg-muted sm:text-[1.0625rem]">{t("lead")}</p>
        <IntentLink
          href="/principles/solid"
          className="mt-6 inline-flex min-h-12 items-center gap-2 rounded-xl bg-accent px-5 text-[0.95rem] font-semibold text-accent-fg transition-opacity hover:opacity-90"
        >
          {t("start")}
          <span aria-hidden="true">→</span>
        </IntentLink>
      </header>

      <section aria-labelledby="cat-solid" className={`mt-12 rounded-3xl border border-border bg-gradient-to-br ${hueClass[solid.hue].soft} to-transparent p-5 sm:p-7`}>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 id="cat-solid" className="text-2xl font-semibold tracking-tight">
              <IntentLink href="/principles/solid" className="hover:text-accent">
                {solid.title[locale]}
              </IntentLink>
            </h2>
            <p className="mt-1.5 max-w-2xl text-[0.95rem] leading-relaxed text-fg-muted">{t("solidLead")}</p>
          </div>
          <span className="font-mono text-xs text-fg-subtle">{t("count", { count: entriesIn(principlesLib, "solid").length })}</span>
        </div>
        <ol className="mt-6 grid gap-3 sm:grid-cols-5">
          {entriesIn(principlesLib, "solid").map((p) => (
            <li key={p.slug}>
              <IntentLink
                href={`/principles/solid/${p.slug}`}
                className="group flex h-full items-start gap-4 rounded-2xl border border-border bg-bg p-4 transition-all hover:-translate-y-0.5 hover:border-indigo-500/50 hover:shadow-soft motion-reduce:transition-none motion-reduce:hover:translate-y-0 sm:flex-col sm:gap-2"
              >
                <span aria-hidden="true" className="text-[2.6rem] leading-none font-bold text-indigo-600 dark:text-indigo-300">
                  {p.short}
                </span>
                <span className="min-w-0">
                  <span className="block font-semibold leading-snug group-hover:text-accent">{p.name}</span>
                  <span className="mt-1 block text-sm leading-relaxed text-fg-muted">{p.tagline[locale]}</span>
                </span>
              </IntentLink>
            </li>
          ))}
        </ol>
      </section>

      <h2 className="mt-14 text-xl font-semibold">{t("categories")}</h2>
      <ul className="mt-5 grid gap-4 md:grid-cols-2">
        {rest.map((c) => (
          <li key={c.slug} className="flex flex-col rounded-2xl border border-border bg-surface-1 p-5 sm:p-6">
            <IntentLink href={`/principles/${c.slug}`} className="group flex items-center gap-2.5">
              <span aria-hidden="true" className={`size-2.5 rounded-full bg-current ${hueClass[c.hue].text}`} />
              <span className="text-lg font-semibold group-hover:text-accent">{c.title[locale]}</span>
              <span className="ml-auto font-mono text-xs text-fg-subtle">{t("count", { count: entriesIn(principlesLib, c.slug).length })}</span>
            </IntentLink>
            <p className="mt-2 text-[0.95rem] leading-relaxed text-fg-muted">{c.summary[locale]}</p>
            <ul className="mt-4 flex flex-wrap gap-2">
              {entriesIn(principlesLib, c.slug).map((p) => (
                <li key={p.slug}>
                  <IntentLink
                    href={`/principles/${c.slug}/${p.slug}`}
                    className="inline-flex min-h-9 items-center gap-2 rounded-full border border-border bg-bg py-1 pr-3 pl-1.5 text-sm transition-colors hover:border-fg-subtle hover:text-fg"
                  >
                    <span className={`rounded-full px-2 py-0.5 font-mono text-[0.65rem] font-bold ${hueClass[c.hue].badge}`}>{p.short}</span>
                    {p.name}
                  </IntentLink>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </>
  );
}
