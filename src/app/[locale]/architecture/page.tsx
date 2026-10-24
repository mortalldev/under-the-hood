import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { IntentLink } from "@/components/layout/IntentLink";
import { CategoryGrid } from "@/components/library/CategoryGrid";
import { architectureLib, categories, topics } from "@/content/architecture/registry";
import { entryHref, hueClass } from "@/content/library";
import type { Locale } from "@/i18n/routing";
import { jsonLd, pageMetadata } from "@/lib/seo";
import { site } from "@/lib/site";

export async function generateMetadata(): Promise<Metadata> {
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("Architecture");
  return pageMetadata({ locale, path: "/architecture", title: t("title"), description: t("lead") });
}

/** The three scales, drawn as nested bands: the same question at each level. */
const scales = [
  { slug: "frontend", en: "One frontend app", uz: "Bitta frontend ilova", q: { en: "Which folder may import which?", uz: "Qaysi papka qaysi birini import qila oladi?" } },
  { slug: "application", en: "One deployable", uz: "Bitta deploy", q: { en: "Do rules depend on the database, or the reverse?", uz: "Qoidalar bazaga bogʻliqmi yoki aksincha?" } },
  { slug: "distributed", en: "Many services", uz: "Koʻp service", q: { en: "Who owns the data, and how do services agree?", uz: "Ma'lumotga kim egalik qiladi va service'lar qanday kelishadi?" } },
] as const;

export default async function ArchitecturePage() {
  const [t, locale] = await Promise.all([getTranslations("Architecture"), getLocale() as Promise<Locale>]);

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "DefinedTermSet",
    name: t("title"),
    url: `${site.url}/${locale}/architecture`,
    inLanguage: locale,
    hasDefinedTerm: topics.map((p) => ({
      "@type": "DefinedTerm",
      name: p.name,
      description: p.tagline[locale],
      url: `${site.url}/${locale}${entryHref(architectureLib, p)}`,
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
          href="/architecture/frontend/feature-sliced-design"
          className="mt-6 inline-flex min-h-12 items-center gap-2 rounded-xl bg-accent px-5 text-[0.95rem] font-semibold text-accent-fg transition-opacity hover:opacity-90"
        >
          {t("start")}
          <span aria-hidden="true">→</span>
        </IntentLink>
      </header>

      <section aria-labelledby="map" className="mt-12">
        <h2 id="map" className="text-xl font-semibold">
          {t("mapTitle")}
        </h2>
        <p className="mt-1.5 max-w-2xl text-[0.95rem] leading-relaxed text-fg-muted">{t("mapLead")}</p>
        <ol className="mt-5 space-y-2">
          {scales.map((s, i) => {
            const c = categories.find((x) => x.slug === s.slug)!;
            const hue = hueClass[c.hue];
            return (
              <li key={s.slug} style={{ marginInlineStart: `${i * 1.25}rem` }}>
                <IntentLink
                  href={`/architecture/${s.slug}`}
                  className={`group flex flex-wrap items-center gap-x-4 gap-y-1 rounded-2xl border border-border bg-gradient-to-r ${hue.soft} to-transparent px-4 py-3.5 transition-colors ${hue.ring}`}
                >
                  <span className={`font-mono text-xs font-bold ${hue.text}`}>{String(i + 1).padStart(2, "0")}</span>
                  <span className="font-semibold group-hover:text-accent">{s[locale]}</span>
                  <span className="text-sm text-fg-muted">{s.q[locale]}</span>
                </IntentLink>
              </li>
            );
          })}
        </ol>
      </section>

      <h2 className="mt-14 text-xl font-semibold">{t("categories")}</h2>
      <CategoryGrid lib={architectureLib} locale={locale} numbered />
    </>
  );
}
