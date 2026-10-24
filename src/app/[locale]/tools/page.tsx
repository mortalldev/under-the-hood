import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { IntentLink } from "@/components/layout/IntentLink";
import { hueClass } from "@/content/library";
import { defaultStack, TOOLS_CHECKED, toolCategories, tools, toolsIn } from "@/content/tools/registry";
import type { Locale } from "@/i18n/routing";
import { jsonLd, pageMetadata } from "@/lib/seo";
import { site } from "@/lib/site";

export async function generateMetadata(): Promise<Metadata> {
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("Tools");
  return pageMetadata({ locale, path: "/tools", title: t("title"), description: t("lead") });
}

export default async function ToolsPage() {
  const [t, locale] = await Promise.all([getTranslations("Tools"), getLocale() as Promise<Locale>]);
  const checked = new Intl.DateTimeFormat(locale, { dateStyle: "long" }).format(new Date(TOOLS_CHECKED));

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: t("title"),
    url: `${site.url}/${locale}/tools`,
    itemListElement: tools.map((x, i) => ({ "@type": "ListItem", position: i + 1, name: x.name, url: x.docs })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(structuredData) }} />

      <header className="max-w-3xl">
        <p className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-1 px-3 py-1 text-xs font-medium text-fg-muted">
          <span aria-hidden="true" className="size-1.5 rounded-full bg-accent" />
          {t("stats", { tools: tools.length, categories: toolCategories.length })}
        </p>
        <h1 className="mt-5 text-[1.8rem] leading-[1.15] font-semibold tracking-tight text-balance sm:text-[2.4rem]">{t("title")}</h1>
        <p className="mt-4 text-base leading-relaxed text-fg-muted sm:text-[1.0625rem]">{t("lead")}</p>
        <p className="mt-3 text-sm text-fg-subtle">{t("checked", { date: checked })}</p>
      </header>

      <section aria-labelledby="stack" className="mt-10 rounded-3xl border border-border bg-gradient-to-br from-accent/10 to-transparent p-5 sm:p-7">
        <h2 id="stack" className="text-xl font-semibold">
          {t("stackTitle")}
        </h2>
        <p className="mt-1.5 max-w-2xl text-[0.95rem] leading-relaxed text-fg-muted">{t("stackLead")}</p>
        <ol className="mt-5 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
          {defaultStack.map(({ category, tool }) => (
            <li key={category.slug}>
              <IntentLink
                href={`/tools/${category.slug}#${tool.slug}`}
                className={`group flex h-full items-center gap-3 rounded-xl border border-border bg-bg px-3.5 py-2.5 transition-colors ${hueClass[category.hue].ring}`}
              >
                <span aria-hidden="true" className={`size-2 shrink-0 rounded-full ${hueClass[category.hue].dot}`} />
                <span className="min-w-0">
                  <span className="block text-xs text-fg-subtle">{category.title[locale]}</span>
                  <span className="block font-semibold group-hover:text-accent">{tool.name}</span>
                </span>
              </IntentLink>
            </li>
          ))}
        </ol>
      </section>

      <h2 className="mt-14 text-xl font-semibold">{t("categories")}</h2>
      <ul className="mt-5 grid gap-4 md:grid-cols-2">
        {toolCategories.map((c) => (
          <li key={c.slug} className="flex flex-col rounded-2xl border border-border bg-surface-1 p-5">
            <IntentLink href={`/tools/${c.slug}`} className="group flex items-center gap-2.5">
              <span aria-hidden="true" className={`size-2.5 rounded-full ${hueClass[c.hue].dot}`} />
              <span className="text-lg font-semibold group-hover:text-accent">{c.title[locale]}</span>
              <span className="ml-auto font-mono text-xs text-fg-subtle">{t("count", { count: toolsIn(c.slug).length })}</span>
            </IntentLink>
            <p className="mt-2 text-[0.93rem] leading-relaxed text-fg-muted">{c.summary[locale]}</p>
            <ul className="mt-4 flex flex-wrap gap-2">
              {toolsIn(c.slug).map((x) => (
                <li key={x.slug}>
                  <IntentLink
                    href={`/tools/${c.slug}#${x.slug}`}
                    className={`inline-flex min-h-9 items-center rounded-full border px-3 text-sm transition-colors hover:border-fg-subtle hover:text-fg ${x.slug === c.pick ? "border-accent/40 bg-accent-soft text-accent" : "border-border bg-bg text-fg-muted"}`}
                  >
                    {x.name}
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
