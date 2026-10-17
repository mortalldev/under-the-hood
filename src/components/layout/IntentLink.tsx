"use client";

import { useState, type ComponentProps } from "react";
import { Link } from "@/i18n/navigation";

/**
 * A Link that upgrades to a full per-link prefetch (`prefetch={true}`) once
 * the user shows intent — pointer hover, touch start or keyboard focus.
 *
 * Until then it keeps the default prefetch, which under Partial Prefetching is
 * the route's shared App Shell (one request per route, not per link). Lesson
 * pages are fully static, so the upgraded prefetch is served from static output
 * and the page usually appears complete on click instead of showing a skeleton.
 * Prefetching every visible lesson link up front would download dozens of
 * lessons nobody opens — painful on mobile data.
 */
export function IntentLink({ onPointerEnter, onTouchStart, onFocus, ...props }: ComponentProps<typeof Link>) {
  const [intent, setIntent] = useState(false);

  return (
    <Link
      {...props}
      prefetch={intent ? true : null}
      onPointerEnter={(e) => {
        setIntent(true);
        onPointerEnter?.(e);
      }}
      onTouchStart={(e) => {
        setIntent(true);
        onTouchStart?.(e);
      }}
      onFocus={(e) => {
        setIntent(true);
        onFocus?.(e);
      }}
    />
  );
}
