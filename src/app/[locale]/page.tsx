import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { SectionGrid } from "@/components/SectionGrid";
import { lessons, sectionSlugs } from "@/content/registry";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { jsonLd, pageMetadata } from "@/lib/seo";
import { site } from "@/lib/site";

const lessonParts = [
  "tldr",
  "visual",
  "mechanism",
  "code",
  "when",
  "tradeoffs",
  "nuance",
  "interview",
  "exercise",
  "resources",
] as const;

export async function generateMetadata(): Promise<Metadata> {
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("Site");
  return pageMetadata({ locale, path: "", description: t("description") });
}

export default async function HomePage() {
  const t = await getTranslations();
  const locale = (await getLocale()) as Locale;
  const lessonCount = sectionSlugs.reduce((n, s) => n + lessons[s].length, 0);

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "WebSite", name: site.name, url: `${site.url}/${locale}`, inLanguage: locale, description: t("Site.description") },
      { "@type": "Organization", name: site.name, url: site.url, logo: `${site.url}/icon.svg` },
    ],
  };

  const how = [
    { title: t("Home.how1"), body: t("Home.how1Body"), icon: "M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.3 1 2.3h6c0-1 .4-1.8 1-2.3A7 7 0 0 0 12 2z" },
    { title: t("Home.how2"), body: t("Home.how2Body"), icon: "M8 5v14l11-7z" },
    { title: t("Home.how3"), body: t("Home.how3Body"), icon: "M4 12.5 9 17.5 20 6.5" },
  ];

  return (
    <main className="mx-auto max-w-7xl px-4">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(structuredData) }} />

      <section className="grid items-center gap-12 py-14 sm:py-20 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:py-24">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-1 px-3 py-1 text-xs font-medium text-fg-muted">
            <span aria-hidden="true" className="size-1.5 rounded-full bg-accent" />
            {t("Home.eyebrow")}
          </p>
          <h1 className="mt-6 max-w-2xl text-[2rem] leading-[1.15] font-semibold tracking-tight text-balance sm:text-[2.75rem] sm:leading-[1.1]">
            {t("Home.title")}
          </h1>
          <p className="mt-6 max-w-xl text-[1.0625rem] leading-relaxed text-fg-muted sm:text-lg">{t("Home.lead")}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/learn/start/how-to-learn"
              className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-accent px-5 text-[0.95rem] font-semibold text-accent-fg transition-opacity hover:opacity-90"
            >
              {t("Home.start")}
              <span aria-hidden="true">→</span>
            </Link>
            <Link
              href="/learn"
              className="inline-flex min-h-12 items-center rounded-xl border border-border bg-bg px-5 text-[0.95rem] font-semibold transition-colors hover:bg-surface-2"
            >
              {t("Home.browse")}
            </Link>
          </div>
          <p className="mt-6 text-sm text-fg-subtle">{t("Home.stats", { lessons: lessonCount, viz: 36 })}</p>
        </div>

        <HeroPreview title={t("Home.previewTitle")} note={t("Home.previewNote")} codeLabel={t("Visualizer.code")} />
      </section>

      <section aria-labelledby="how" className="border-t border-border py-14">
        <h2 id="how" className="text-xl font-semibold tracking-tight sm:text-[1.6rem]">
          {t("Home.howTitle")}
        </h2>
        <ol className="mt-8 grid gap-4 md:grid-cols-3">
          {how.map((step, i) => (
            <li key={step.title} className="rounded-2xl border border-border bg-surface-1 p-6">
              <div className="flex items-center gap-3">
                <span aria-hidden="true" className="grid size-10 place-items-center rounded-xl bg-accent-soft text-accent">
                  <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d={step.icon} />
                  </svg>
                </span>
                <span className="font-mono text-xs text-fg-subtle">0{i + 1}</span>
              </div>
              <h3 className="mt-4 text-lg font-semibold">{step.title}</h3>
              <p className="mt-2 leading-relaxed text-fg-muted">{step.body}</p>
            </li>
          ))}
        </ol>

        <h3 className="mt-12 text-sm font-semibold text-fg-muted">{t("Home.partsTitle")}</h3>
        <ol className="mt-4 flex flex-wrap gap-2 text-sm">
          {lessonParts.map((part, i) => (
            <li key={part} className="flex items-center gap-2 rounded-full border border-border bg-bg py-1 pl-1 pr-3 text-fg-muted">
              <span className="grid size-6 place-items-center rounded-full bg-surface-2 font-mono text-[0.7rem]">{i + 1}</span>
              {t(`LessonParts.${part}`)}
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="sections" className="border-t border-border py-14">
        <h2 id="sections" className="mb-8 text-xl font-semibold tracking-tight sm:text-[1.6rem]">
          {t("Home.sectionsTitle")}
        </h2>
        <SectionGrid />
      </section>
    </main>
  );
}

/**
 * Static snapshot of a visualizer frame (sliding window on "abcabcbb"), drawn
 * with plain HTML so the hero shows what a lesson looks like without loading
 * any animation code.
 */
function HeroPreview({ title, note, codeLabel }: { title: string; note: string; codeLabel: string }) {
  const cells = "abcabcbb".split("");
  const code = [
    "for (let right = 0; right < s.length; right++) {",
    "  const prev = last.get(s[right]);",
    "  if (prev >= left) left = prev + 1;",
    "  last.set(s[right], right);",
    "  best = Math.max(best, right - left + 1);",
    "}",
  ];
  return (
    <figure aria-hidden="true" className="relative hidden overflow-hidden rounded-2xl border border-border bg-surface-1 shadow-soft sm:block">
      <div className="flex items-center gap-2.5 border-b border-border px-5 py-3.5 text-sm font-semibold">
        <span className="grid size-7 place-items-center rounded-lg bg-accent-soft text-accent">
          <svg viewBox="0 0 24 24" className="size-3.5" fill="currentColor">
            <path d="M8 5v14l11-7z" />
          </svg>
        </span>
        {title}
        <span className="ml-auto font-mono text-xs font-normal text-fg-subtle">4 / 28</span>
      </div>
      <div className="px-5 pt-6">
        <div className="flex gap-1.5">
          {cells.map((c, i) => (
            <span
              key={i}
              className={`grid size-10 place-items-center rounded-lg border font-mono text-sm ${
                i === 3 ? "border-rose-400 bg-rose-500/15" : i >= 1 && i <= 2 ? "border-accent bg-accent-soft" : "border-border bg-bg text-fg-muted"
              }`}
            >
              {c}
            </span>
          ))}
        </div>
        <div className="mt-1.5 flex gap-1.5 font-mono text-[0.7rem] font-semibold">
          {cells.map((_, i) => (
            <span key={i} className="w-10 text-center text-accent">
              {i === 1 ? "left" : i === 3 ? <span className="text-rose-500">right</span> : ""}
            </span>
          ))}
        </div>
        <p className="mt-4 rounded-xl bg-bg px-4 py-3 text-sm leading-relaxed text-fg-muted">{note}</p>
      </div>
      <div className="mt-5 border-t border-border bg-code-bg py-3 font-mono text-[0.78rem] leading-[1.7]">
        <p className="px-5 pb-1 text-[0.65rem] tracking-wider text-fg-subtle uppercase">{codeLabel}</p>
        {code.map((line, i) => (
          <div key={i} className={`flex border-l-2 pr-4 ${i === 2 ? "border-accent bg-accent-soft text-fg" : "border-transparent text-fg-muted"}`}>
            <span className="w-9 shrink-0 pr-3 text-right text-fg-subtle">{i + 1}</span>
            <span className="truncate whitespace-pre">{line}</span>
          </div>
        ))}
      </div>
    </figure>
  );
}
