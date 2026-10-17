import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { ResourceList } from "@/components/mdx/Resources";
import { sectionSlugs } from "@/content/registry";
import { resources } from "@/content/resources";
import type { Locale } from "@/i18n/routing";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("Resources");
  return pageMetadata({ locale, path: "/resources", title: t("pageTitle"), description: t("pageLead") });
}

export default async function ResourcesPage() {
  const t = await getTranslations();
  const tr = await getTranslations("Resources");

  return (
    <main className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="text-[1.6rem] font-semibold tracking-tight sm:text-[2rem]">{tr("pageTitle")}</h1>
      <p className="mt-3 max-w-3xl text-fg-muted">{tr("pageLead")}</p>
      <p className="mt-2 text-sm text-fg-subtle">{tr("uzNote")}</p>
      {sectionSlugs
        .filter((s) => s !== "start")
        .map((section) => {
          const items = resources.filter((r) => r.topics.some((topic) => topic === section || topic.startsWith(`${section}/`)));
          if (items.length === 0) return null;
          return (
            <section key={section} aria-labelledby={`res-${section}`} className="mt-10">
              <h2 id={`res-${section}`} className="text-xl font-semibold">
                {t(`Sections.${section}.title`)}
              </h2>
              <ResourceList items={items} t={tr} />
            </section>
          );
        })}
    </main>
  );
}
