import { getTranslations } from "next-intl/server";
import { IntentLink } from "@/components/layout/IntentLink";
import { entriesIn, entryHref, hueClass, libraryNs, type Library } from "@/content/library";
import type { Locale } from "@/i18n/routing";

/**
 * Index-page overview of a library: one card per category, numbered in
 * order, listing every entry with its badge and one-line idea.
 */
export async function CategoryGrid({ lib, locale, numbered = false }: { lib: Library; locale: Locale; numbered?: boolean }) {
  const t = await getTranslations();
  return (
    <ol className="mt-6 grid gap-4 lg:grid-cols-2">
      {lib.categories.map((c, i) => {
        const hue = hueClass[c.hue];
        return (
          <li key={c.slug} className={`flex min-w-0 flex-col rounded-2xl border border-border bg-gradient-to-br ${hue.soft} to-transparent p-5 sm:p-6`}>
            <IntentLink href={`${lib.base}/${c.slug}`} className="group flex items-center gap-3">
              {numbered ? (
                <span className={`font-mono text-sm font-bold ${hue.text}`}>{String(i + 1).padStart(2, "0")}</span>
              ) : (
                <span aria-hidden="true" className={`size-2.5 rounded-full ${hue.dot}`} />
              )}
              <span className="text-lg font-semibold group-hover:text-accent">{c.title[locale]}</span>
              <span className="ml-auto font-mono text-xs text-fg-subtle">{t(`${libraryNs[lib.id]}.count`, { count: entriesIn(lib, c.slug).length })}</span>
            </IntentLink>
            <p className="mt-2 text-[0.95rem] leading-relaxed text-fg-muted">{c.summary[locale]}</p>
            <ul className="mt-4 grid gap-1.5">
              {entriesIn(lib, c.slug).map((e) => (
                <li key={e.slug} className="min-w-0">
                  <IntentLink
                    href={entryHref(lib, e)}
                    className="group flex min-h-11 items-center gap-3 rounded-xl border border-transparent bg-bg/70 px-2.5 py-1.5 transition-colors hover:border-border hover:bg-bg"
                  >
                    <span className={`min-w-14 shrink-0 rounded-md px-1.5 py-0.5 text-center font-mono text-[0.66rem] font-bold ${hue.badge}`}>{e.short}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[0.92rem] font-medium leading-snug group-hover:text-accent">{e.name}</span>
                      <span className="block truncate text-xs text-fg-subtle">{e.tagline[locale]}</span>
                    </span>
                  </IntentLink>
                </li>
              ))}
            </ul>
          </li>
        );
      })}
    </ol>
  );
}
