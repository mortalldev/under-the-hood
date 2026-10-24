import { getLocale, getTranslations } from "next-intl/server";
import { AutoCloseDetails } from "@/components/layout/AutoCloseDetails";
import { NavLink } from "@/components/layout/NavLink";
import { entriesIn, entryHref, hueClass, libraryNs, type Library } from "@/content/library";
import type { Locale } from "@/i18n/routing";

/** Category → entry navigation for every page of a library (/principles, /architecture, /git). */
export async function LibrarySidebar({ lib }: { lib: Library }) {
  const [tr, locale] = await Promise.all([getTranslations(), getLocale() as Promise<Locale>]);
  const ns = libraryNs[lib.id];
  const t = (key: "all" | "categories" | "nav") => tr(`${ns}.${key}`);

  const tree = (
    <div className="space-y-4">
      <NavLink href={lib.base} className="block rounded-lg px-2.5 py-1.5 text-[0.9rem] font-semibold text-fg-muted hover:bg-surface-2 hover:text-fg" activeClassName="!bg-accent-soft !text-accent">
        {t("all")}
      </NavLink>
      {lib.categories.map((c) => (
        <div key={c.slug}>
          <NavLink
            href={`${lib.base}/${c.slug}`}
            className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-[0.82rem] font-semibold tracking-wide text-fg-muted uppercase hover:bg-surface-2 hover:text-fg"
            activeClassName="!text-fg"
          >
            <span aria-hidden="true" className={`size-2 rounded-full bg-current ${hueClass[c.hue].text}`} />
            {c.title[locale]}
          </NavLink>
          <ul className="mt-1 ml-[0.95rem] border-l border-border">
            {entriesIn(lib, c.slug).map((p) => (
              <li key={p.slug}>
                <NavLink
                  href={entryHref(lib, p)}
                  className="-ml-px flex items-center gap-2 border-l-2 border-transparent py-1.5 pr-2 pl-3 text-[0.86rem] leading-snug text-fg-muted transition-colors hover:border-fg-subtle hover:text-fg"
                  activeClassName="!border-accent !bg-accent-soft !text-accent font-medium rounded-r-lg"
                >
                  <span className={`min-w-9 max-w-16 shrink-0 truncate rounded px-1 text-center font-mono text-[0.65rem] font-bold ${hueClass[c.hue].badge}`}>{p.short}</span>
                  <span className="min-w-0 flex-1">{p.name}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      ))}
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
