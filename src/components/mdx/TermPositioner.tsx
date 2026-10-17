"use client";

import { useEffect } from "react";

const MARGIN = 8;

/**
 * One document-level listener for every glossary <Term>: when a tooltip opens,
 * measure it and shift it horizontally so it stays inside the viewport. Without
 * JS the tooltip still works, it just isn't clamped.
 */
export function TermPositioner() {
  useEffect(() => {
    const place = (e: Event) => {
      if (!(e.target instanceof Element)) return;
      const tip = e.target.closest("[data-term]")?.querySelector<HTMLElement>("[data-term-tip]");
      if (!tip) return;
      tip.style.setProperty("--tip-shift", "0px");
      // Wait a frame so :hover / :focus-within has made the tooltip visible.
      requestAnimationFrame(() => {
        const r = tip.getBoundingClientRect();
        if (r.width === 0 || getComputedStyle(tip).position === "fixed") return;
        const vw = document.documentElement.clientWidth;
        let shift = 0;
        if (r.left < MARGIN) shift = MARGIN - r.left;
        else if (r.right > vw - MARGIN) shift = vw - MARGIN - r.right;
        tip.style.setProperty("--tip-shift", `${Math.round(shift)}px`);
      });
    };
    document.addEventListener("pointerover", place);
    document.addEventListener("focusin", place);
    return () => {
      document.removeEventListener("pointerover", place);
      document.removeEventListener("focusin", place);
    };
  }, []);

  return null;
}
