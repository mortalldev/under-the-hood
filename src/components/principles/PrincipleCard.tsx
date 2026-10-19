import { IntentLink } from "@/components/layout/IntentLink";
import { getCategory, hueClass, type PrincipleMeta } from "@/content/principles/registry";
import type { Locale } from "@/i18n/routing";

/** Card linking to one principle: acronym badge, name, what it stands for, one-line idea. */
export function PrincipleCard({ p, locale }: { p: PrincipleMeta; locale: Locale }) {
  const hue = hueClass[getCategory(p.category).hue];
  return (
    <IntentLink
      href={`/principles/${p.category}/${p.slug}`}
      className={`group flex h-full gap-4 rounded-2xl border border-border bg-surface-1 p-4 transition-colors sm:p-5 ${hue.ring}`}
    >
      <span className={`grid h-12 min-w-12 shrink-0 place-items-center rounded-xl px-2 font-mono text-sm font-bold ${hue.badge}`}>{p.short}</span>
      <span className="min-w-0">
        <span className="block font-semibold group-hover:text-accent">{p.name}</span>
        {p.expansion && p.expansion !== p.name && <span className="block text-xs text-fg-subtle">{p.expansion}</span>}
        <span className="mt-1.5 block text-[0.94rem] leading-relaxed text-fg-muted">{p.tagline[locale]}</span>
      </span>
    </IntentLink>
  );
}
