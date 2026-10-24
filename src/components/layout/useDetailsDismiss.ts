"use client";

import { useEffect, type RefObject } from "react";
import { usePathname } from "@/i18n/navigation";

/**
 * Closes a <details> menu on navigation, Escape (returning focus to its
 * summary) and taps outside it. Without JS the menu still opens and closes
 * natively; this only adds the dismiss behaviour people expect.
 */
export function useDetailsDismiss(ref: RefObject<HTMLDetailsElement | null>) {
  const pathname = usePathname();

  useEffect(() => {
    if (ref.current) ref.current.open = false;
  }, [pathname, ref]);

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
  }, [ref]);
}
