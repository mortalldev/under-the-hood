"use client";

import type { ReactNode } from "react";
import { usePathname } from "@/i18n/navigation";
import { IntentLink } from "./IntentLink";

interface NavLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
  activeClassName?: string;
  /** Also treat nested routes (`href/...`) as active. */
  matchNested?: boolean;
}

export function NavLink({
  href,
  children,
  className = "",
  activeClassName = "",
  matchNested = false,
}: NavLinkProps) {
  const pathname = usePathname();
  const active =
    pathname === href || (matchNested && pathname.startsWith(`${href}/`));

  return (
    <IntentLink
      href={href}
      aria-current={active ? "page" : undefined}
      className={`${className} ${active ? activeClassName : ""}`}
    >
      {children}
    </IntentLink>
  );
}
