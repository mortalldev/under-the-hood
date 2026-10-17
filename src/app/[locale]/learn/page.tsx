import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { pageMetadata } from "@/lib/seo";
import { SectionGrid } from "@/components/SectionGrid";

export async function generateMetadata(): Promise<Metadata> {
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations();
  return pageMetadata({ locale, path: "/learn", title: t("Nav.learn"), description: t("Site.description") });
}

export default async function LearnIndexPage() {
  const t = await getTranslations();

  return (
    <>
      <h1 className="text-[1.6rem] font-semibold tracking-tight sm:text-[2rem]">{t("Nav.learn")}</h1>
      <p className="mt-3 max-w-2xl text-fg-muted">{t("Home.lead")}</p>
      <div className="mt-8">
        <SectionGrid />
      </div>
    </>
  );
}
