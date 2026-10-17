"use client";

import { useTranslations } from "next-intl";
import { useEffect, useRef } from "react";
import { usePathname } from "@/i18n/navigation";
import { NavLink } from "./NavLink";

export interface MenuLink {
  href: string;
  label: string;
  nested: boolean;
}

/**
 * Hamburger menu for small screens. Built on <details> so it still opens
 * without JavaScript; with JS it also closes on navigation, Escape and
 * outside taps.
 */
export function MobileMenu({ links }: { links: MenuLink[] }) {
  const t = useTranslations("Nav");
  const ref = useRef<HTMLDetailsElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    if (ref.current) ref.current.open = false;
  }, [pathname]);

  useEffect(() => {
    const close = (e: Event) => {
      const el = ref.current;
      if (!el?.open) return;
      if (e instanceof KeyboardEvent) {
        if (e.key !== "Escape") return;
        el.open = false;
        el.querySelector("summary")?.focus();
        return;
      }
      if (e.target instanceof Node && !el.contains(e.target)) el.open = false;
    };
    document.addEventListener("keydown", close);
    document.addEventListener("pointerdown", close);
    return () => {
      document.removeEventListener("keydown", close);
      document.removeEventListener("pointerdown", close);
    };
  }, []);

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
        className="absolute inset-x-0 top-full border-b border-border bg-bg px-4 pb-4 pt-2 shadow-lg"
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
      </nav>
    </details>
  );
}
