"use client";

import { useTranslations } from "next-intl";
import { useRef } from "react";
import { MenuIcon, type HandbookItem } from "./HandbookMenu";
import { NavLink } from "./NavLink";
import { useDetailsDismiss } from "./useDetailsDismiss";

export interface MenuLink {
  href: string;
  label: string;
  nested: boolean;
}

/**
 * Hamburger menu for small screens: main links, then the handbook sections
 * with their icons. Built on <details> so it still opens without JavaScript;
 * with JS it also closes on navigation, Escape and outside taps.
 */
export function MobileMenu({ links, handbook, handbookLabel }: { links: MenuLink[]; handbook: HandbookItem[]; handbookLabel: string }) {
  const t = useTranslations("Nav");
  const ref = useRef<HTMLDetailsElement>(null);
  useDetailsDismiss(ref);

  return (
    <details ref={ref} className="group md:hidden">
      <summary
        aria-label={t("openMenu")}
        className="inline-flex size-10 cursor-pointer list-none items-center justify-center rounded-md text-fg-muted hover:bg-surface-2 hover:text-fg [&::-webkit-details-marker]:hidden"
      >
        <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M4 7h16M4 12h16M4 17h16" className="group-open:hidden" />
          <path d="M6 6l12 12M18 6 6 18" className="hidden group-open:block" />
        </svg>
      </summary>
      <nav
        aria-label={t("primary")}
        className="scroll-thin absolute inset-x-0 top-full max-h-[calc(100dvh-3.5rem)] overflow-y-auto overscroll-contain border-b border-border bg-bg px-4 pt-2 pb-4 shadow-lg"
      >
        <ul className="grid gap-1">
          {links.map((l) => (
            <li key={l.href}>
              <NavLink
                href={l.href}
                matchNested={l.nested}
                className="flex min-h-12 items-center rounded-lg px-3 text-base text-fg-muted hover:bg-surface-2 hover:text-fg"
                activeClassName="!bg-surface-2 !text-fg font-semibold"
              >
                {l.label}
              </NavLink>
            </li>
          ))}
        </ul>
        <p className="mt-3 border-t border-border px-3 pt-4 pb-1 text-xs font-semibold tracking-wider text-fg-subtle uppercase">{handbookLabel}</p>
        <ul className="grid grid-cols-2 gap-1.5">
          {handbook.map((i) => (
            <li key={i.href}>
              <NavLink
                href={i.href}
                matchNested
                className="flex min-h-14 items-center gap-2.5 rounded-xl border border-border px-3 text-[0.95rem] text-fg-muted hover:bg-surface-2 hover:text-fg"
                activeClassName="!border-accent/40 !bg-accent-soft !text-accent font-semibold"
              >
                <MenuIcon d={i.icon} className="size-[1.1rem] shrink-0 text-accent" />
                <span className="min-w-0 truncate">{i.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </details>
  );
}
