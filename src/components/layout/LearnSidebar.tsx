import { getLocale, getTranslations } from "next-intl/server";
import { lessons, sectionSlugs } from "@/content/registry";
import type { Locale } from "@/i18n/routing";
import { AutoCloseDetails } from "./AutoCloseDetails";
import { SidebarTree, type SidebarSection } from "./SidebarTree";

export async function LearnSidebar() {
  const t = await getTranslations();
  const locale = (await getLocale()) as Locale;

  const sections: SidebarSection[] = sectionSlugs.map((section) => ({
    slug: section,
    title: t(`Sections.${section}.title`),
    lessons: lessons[section].map((l) => ({ slug: l.slug, title: l.title[locale] })),
  }));
  const labels = { filter: t("Nav.filterLessons"), noMatches: t("Nav.noMatches"), overview: t("Nav.overview") };

  return (
    <>
      {/* Phones and tablets: a collapsible panel (works without JS), closes after navigating. */}
      <AutoCloseDetails
        className="group mb-6 rounded-2xl border border-border bg-surface-1 lg:hidden"
        summary={
          <summary className="flex min-h-12 cursor-pointer list-none items-center gap-2.5 px-4 text-sm font-semibold [&::-webkit-details-marker]:hidden">
            <svg aria-hidden="true" viewBox="0 0 24 24" className="size-4 text-fg-subtle" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M4 6h16M4 12h16M4 18h10" />
            </svg>
            {t("Nav.sections")}
            <svg aria-hidden="true" viewBox="0 0 24 24" className="ml-auto size-4 text-fg-muted transition-transform group-open:rotate-180 motion-reduce:transition-none" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m6 9 6 6 6-6" />
            </svg>
          </summary>
        }
      >
        <nav aria-label={t("Nav.lessonNav")} className="scroll-thin max-h-[70dvh] overflow-y-auto overscroll-contain border-t border-border p-3">
          <SidebarTree sections={sections} labels={labels} />
        </nav>
      </AutoCloseDetails>

      {/* Desktop: a sticky panel with its own (thin) scrollbar. */}
      <nav
        aria-label={t("Nav.lessonNav")}
        className="scroll-thin sticky top-20 hidden max-h-[calc(100dvh-6rem)] overflow-y-auto overscroll-contain rounded-2xl border border-border bg-surface-1 p-3 lg:block"
      >
        <SidebarTree sections={sections} labels={labels} />
      </nav>
    </>
  );
}
