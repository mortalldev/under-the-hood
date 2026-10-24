"use client";

import { useRef } from "react";
import { usePathname } from "@/i18n/navigation";
import { IntentLink } from "./IntentLink";
import { useDetailsDismiss } from "./useDetailsDismiss";

export interface HandbookItem {
  href: string;
  label: string;
  desc: string;
  /** SVG path data on a 24 × 24 grid, drawn as a stroke. */
  icon: string;
  count: number;
}

export const isUnder = (pathname: string, href: string) => pathname === href || pathname.startsWith(`${href}/`);

/** SVG icon used by both the desktop panel and the mobile menu. */
export function MenuIcon({ d, className = "size-[1.15rem]" }: { d: string; className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}

/**
 * Desktop "Handbook" dropdown: one header entry for the reference sections
 * (principles, architecture, tools, git) so the bar stays short as the site
 * grows. A <details> panel, so it works without JavaScript too.
 */
export function HandbookMenu({ label, lead, items }: { label: string; lead: string; items: HandbookItem[] }) {
  const ref = useRef<HTMLDetailsElement>(null);
  const pathname = usePathname();
  useDetailsDismiss(ref);
  const active = items.some((i) => isUnder(pathname, i.href));

  return (
    <details ref={ref} className="group/menu">
      <summary
        className={`flex shrink-0 cursor-pointer list-none items-center gap-1 rounded-lg px-3 py-1.5 transition-colors hover:bg-surface-2 hover:text-fg [&::-webkit-details-marker]:hidden ${active ? "bg-accent-soft font-medium text-accent" : "text-fg-muted"}`}
      >
        {label}
        <svg aria-hidden="true" viewBox="0 0 24 24" className="size-3.5 transition-transform group-open/menu:rotate-180 motion-reduce:transition-none" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m6 9 6 6 6-6" />
        </svg>
      </summary>
      <div className="absolute inset-x-4 top-full z-40 mt-2 rounded-2xl border border-border bg-bg p-3 shadow-2xl lg:right-auto lg:left-40 lg:w-[44rem]">
        <p className="px-3 pt-1 pb-3 text-[0.8rem] leading-relaxed text-fg-muted">{lead}</p>
        <ul className="grid grid-cols-2 gap-1.5">
          {items.map((i) => {
            const current = isUnder(pathname, i.href);
            return (
              <li key={i.href}>
                <IntentLink
                  href={i.href}
                  aria-current={current ? "page" : undefined}
                  className={`group flex h-full gap-3 rounded-xl border p-3 transition-colors ${current ? "border-accent/40 bg-accent-soft" : "border-transparent hover:border-border hover:bg-surface-1"}`}
                >
                  <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-accent-soft text-accent">
                    <MenuIcon d={i.icon} />
                  </span>
                  <span className="min-w-0">
                    <span className="flex items-baseline gap-2 font-semibold text-fg group-hover:text-accent">
                      {i.label}
                      <span className="font-mono text-[0.68rem] font-normal text-fg-subtle">{i.count}</span>
                    </span>
                    <span className="mt-0.5 block text-[0.8rem] leading-snug text-fg-muted">{i.desc}</span>
                  </span>
                </IntentLink>
              </li>
            );
          })}
        </ul>
      </div>
    </details>
  );
}
