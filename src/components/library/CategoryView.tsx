import { getTranslations } from "next-intl/server";
import { EntryCard } from "@/components/library/EntryCard";
import { categoryOf, entriesIn, hueClass, libraryNs, type Library } from "@/content/library";
import type { Locale } from "@/i18n/routing";

/** Body of a library category page: tinted header, then one card per entry. */
export async function CategoryView({ lib, category, locale }: { lib: Library; category: string; locale: Locale }) {
  const t = await getTranslations();
  const c = categoryOf(lib, category);
  const items = entriesIn(lib, category);
  // SOLID-style categories (one letter per entry) also spell their name out.
  const letters = items.every((p) => p.short.length === 1);

  return (
    <>
      <header className={`rounded-3xl border border-border bg-gradient-to-br ${hueClass[c.hue].soft} to-transparent p-5 sm:p-7`}>
        <p className={`font-mono text-xs font-semibold tracking-wider uppercase ${hueClass[c.hue].text}`}>{t(`${libraryNs[lib.id]}.count`, { count: items.length })}</p>
        <h1 className="mt-2 text-[1.7rem] font-semibold tracking-tight sm:text-[2.1rem]">{c.title[locale]}</h1>
        <p className="mt-2.5 max-w-2xl text-base leading-relaxed text-fg-muted">{c.summary[locale]}</p>
        {letters && (
          <p aria-hidden="true" className="mt-5 flex gap-2 sm:gap-3">
            {items.map((p) => (
              <span key={p.slug} className={`grid size-11 place-items-center rounded-xl text-xl font-bold sm:size-14 sm:text-2xl ${hueClass[c.hue].badge}`}>
                {p.short}
              </span>
            ))}
          </p>
        )}
      </header>
      <ol className="mt-8 grid gap-3 xl:grid-cols-2">
        {items.map((p) => (
          <li key={p.slug}>
            <EntryCard lib={lib} entry={p} locale={locale} />
          </li>
        ))}
      </ol>
    </>
  );
}
