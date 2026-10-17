import { useLocale } from "next-intl";
import { useId, type ReactNode } from "react";
import { glossary, type GlossaryId } from "@/content/glossary";

interface TermProps {
  id: GlossaryId;
  /** Visible text; defaults to the canonical (English) term. */
  children?: ReactNode;
}

/**
 * Glossary term with a hover/focus tooltip. Works without JavaScript: the
 * tooltip is revealed with CSS on hover and on keyboard/tap focus. It is
 * `display: none` while closed, so off-screen tooltips never widen the page.
 * Phones get a fixed card at the bottom of the screen; wider screens get a
 * bubble above the term that TermPositioner nudges back inside the viewport.
 */
export function Term({ id, children }: TermProps) {
  const locale = useLocale();
  const tooltipId = useId();
  const entry = glossary[id];

  return (
    <span data-term="" className="group relative inline-block">
      <span
        tabIndex={0}
        aria-describedby={tooltipId}
        className="cursor-help underline decoration-accent/60 decoration-dotted underline-offset-4 outline-none focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-accent"
      >
        {children ?? entry.term}
      </span>
      <span
        role="tooltip"
        id={tooltipId}
        data-term-tip=""
        className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 hidden w-72 max-w-[calc(100vw-2rem)] translate-x-[calc(-50%+var(--tip-shift,0px))] rounded-lg border border-border bg-surface-1 p-3 text-left text-sm font-normal leading-snug text-fg shadow-lg group-focus-within:block group-hover:block max-sm:fixed max-sm:inset-x-4 max-sm:top-auto max-sm:bottom-4 max-sm:mb-0 max-sm:w-auto max-sm:max-w-none max-sm:translate-x-0"
      >
        <span className="mb-1 block font-mono text-xs text-accent">{entry.term}</span>
        {entry.definition[locale]}
      </span>
    </span>
  );
}
