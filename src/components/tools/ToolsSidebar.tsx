import { getLocale, getTranslations } from "next-intl/server";
import { AutoCloseDetails } from "@/components/layout/AutoCloseDetails";
import { NavLink } from "@/components/layout/NavLink";
import { hueClass } from "@/content/library";
import { toolCategories, toolsIn } from "@/content/tools/registry";
import type { Locale } from "@/i18n/routing";

/** Category navigation for every page under /tools, with each category's tool count. */
export async function ToolsSidebar() {
  const [t, locale] = await Promise.all([getTranslations("Tools"), getLocale() as Promise<Locale>]);

  const tree = (
    <div className="space-y-1">
      <NavLink href="/tools" className="block rounded-lg px-2.5 py-1.5 text-[0.9rem] font-semibold text-fg-muted hover:bg-surface-2 hover:text-fg" activeClassName="!bg-accent-soft !text-accent">
        {t("all")}
      </NavLink>
      <ul className="pt-2">
        {toolCategories.map((c) => (
          <li key={c.slug}>
            <NavLink
              href={`/tools/${c.slug}`}
              className="flex min-h-10 items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-[0.88rem] text-fg-muted transition-colors hover:bg-surface-2 hover:text-fg"
              activeClassName="!bg-accent-soft !text-accent font-medium"
            >
              <span aria-hidden="true" className={`size-2 shrink-0 rounded-full ${hueClass[c.hue].dot}`} />
              <span className="min-w-0 flex-1 leading-snug">{c.title[locale]}</span>
              <span className="font-mono text-[0.68rem] text-fg-subtle">{toolsIn(c.slug).length}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <>
      <AutoCloseDetails
        className="group mb-6 rounded-2xl border border-border bg-surface-1 lg:hidden"
        summary={
          <summary className="flex min-h-12 cursor-pointer list-none items-center gap-2.5 px-4 text-sm font-semibold [&::-webkit-details-marker]:hidden">
            <svg aria-hidden="true" viewBox="0 0 24 24" className="size-4 text-fg-subtle" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M4 6h16M4 12h16M4 18h10" />
            </svg>
            {t("categories")}
            <svg aria-hidden="true" viewBox="0 0 24 24" className="ml-auto size-4 text-fg-muted transition-transform group-open:rotate-180 motion-reduce:transition-none" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m6 9 6 6 6-6" />
            </svg>
          </summary>
        }
      >
        <nav aria-label={t("nav")} className="scroll-thin max-h-[70dvh] overflow-y-auto overscroll-contain border-t border-border p-3">
          {tree}
        </nav>
      </AutoCloseDetails>
      <nav
        aria-label={t("nav")}
        className="scroll-thin sticky top-20 hidden max-h-[calc(100dvh-6rem)] overflow-y-auto overscroll-contain rounded-2xl border border-border bg-surface-1 p-3 lg:block"
      >
        {tree}
      </nav>
    </>
  );
}
