"use client";

import { useEffect, useRef, useState } from "react";
import type { OutlineItem } from "@/content/lesson-outline";

/**
 * Sticky tab bar with the lesson's parts (TL;DR, Visual model, Mechanism, …).
 * The tab of the section being read is highlighted (scroll-spy) and kept in
 * view inside the bar. Links are plain #anchors, so it also works without JS.
 */
export function LessonTabs({ items, label }: { items: OutlineItem[]; label: string }) {
  const [active, setActive] = useState(items[0]?.id);
  const bar = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const targets = items.map((i) => document.getElementById(i.id)).filter((el): el is HTMLElement => el !== null);
    if (targets.length === 0) return;
    // A heading becomes "current" once it passes the sticky header + tab bar.
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-120px 0px -65% 0px" },
    );
    targets.forEach((t) => observer.observe(t));
    return () => observer.disconnect();
  }, [items]);

  useEffect(() => {
    const el = bar.current?.querySelector<HTMLElement>(`[data-id="${active}"]`);
    const container = bar.current;
    if (!el || !container) return;
    const left = el.offsetLeft - container.clientWidth / 2 + el.clientWidth / 2;
    container.scrollTo({ left, behavior: "smooth" });
  }, [active]);

  if (items.length < 2) return null;

  return (
    <nav aria-label={label} className="sticky top-14 z-20 -mx-4 mb-2 border-b border-border/70 bg-bg/85 backdrop-blur-md sm:mx-0">
      <div ref={bar} className="flex gap-1 overflow-x-auto overscroll-x-contain px-4 py-2 [scrollbar-width:none] sm:px-0 [&::-webkit-scrollbar]:hidden">
        {items.map((item, i) => {
          const current = item.id === active;
          return (
            <a
              key={item.id}
              data-id={item.id}
              href={`#${item.id}`}
              aria-current={current ? "location" : undefined}
              onClick={() => setActive(item.id)}
              className={`flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm whitespace-nowrap transition-colors ${
                current ? "bg-accent text-accent-fg" : "text-fg-muted hover:bg-surface-2 hover:text-fg"
              }`}
            >
              <span className={`font-mono text-[0.7rem] ${current ? "opacity-80" : "text-fg-subtle"}`}>{String(i + 1).padStart(2, "0")}</span>
              {item.title}
            </a>
          );
        })}
      </div>
    </nav>
  );
}
