import { IntentLink } from "@/components/layout/IntentLink";
import { categoryOf, entryHref, hueClass, type Library, type LibraryEntry } from "@/content/library";
import type { Locale } from "@/i18n/routing";

/** Card linking to one library entry: badge, name, what it stands for, one-line idea. */
export function EntryCard({ lib, entry: e, locale }: { lib: Library; entry: LibraryEntry; locale: Locale }) {
  const hue = hueClass[categoryOf(lib, e.category).hue];
  return (
    <IntentLink
      href={entryHref(lib, e)}
      className={`group flex h-full gap-4 rounded-2xl border border-border bg-surface-1 p-4 transition-colors sm:p-5 ${hue.ring}`}
    >
      <span className={`grid h-12 min-w-12 shrink-0 place-items-center rounded-xl px-2 font-mono text-sm font-bold ${hue.badge}`}>{e.short}</span>
      <span className="min-w-0">
        <span className="block font-semibold group-hover:text-accent">{e.name}</span>
        {e.expansion && e.expansion !== e.name && <span className="block text-xs text-fg-subtle">{e.expansion}</span>}
        <span className="mt-1.5 block text-[0.94rem] leading-relaxed text-fg-muted">{e.tagline[locale]}</span>
      </span>
    </IntentLink>
  );
}
