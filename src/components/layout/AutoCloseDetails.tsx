"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { usePathname } from "@/i18n/navigation";

/**
 * A <details> disclosure that closes itself after client-side navigation —
 * layouts persist between routes, so a mobile menu would otherwise stay open
 * over the page the user just picked.
 */
export function AutoCloseDetails({ className, summary, children }: { className?: string; summary: ReactNode; children: ReactNode }) {
  const ref = useRef<HTMLDetailsElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    if (ref.current) ref.current.open = false;
  }, [pathname]);

  return (
    <details ref={ref} className={className}>
      {summary}
      {children}
    </details>
  );
}
