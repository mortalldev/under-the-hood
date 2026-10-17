"use client";

import { useId, useMemo, useState } from "react";
import { usePathname } from "@/i18n/navigation";
import { useProgress } from "@/lib/progress";
import { NavLink } from "./NavLink";

export interface SidebarSection {
  slug: string;
  title: string;
  lessons: { slug: string; title: string }[];
}

interface Labels {
  filter: string;
  noMatches: string;
  overview: string;
}

/**
 * Course navigation: one accordion per section (the current one open), a
 * filter for jumping to any lesson, and learned/total counts from local
 * progress. Shared by the desktop sidebar and the mobile "Sections" menu.
 */
export function SidebarTree({ sections, labels }: { sections: SidebarSection[]; labels: Labels }) {
  const pathname = usePathname();
  const current = sections.find((s) => pathname === `/learn/${s.slug}` || pathname.startsWith(`/learn/${s.slug}/`))?.slug;
  // Sections the user toggled; the current section is open unless they closed it.
  const [toggled, setToggled] = useState<Record<string, boolean>>({});
  const [query, setQuery] = useState("");
  const { data } = useProgress();
  const baseId = useId();

  const q = query.trim().toLocaleLowerCase();
  const visible = useMemo(
    () =>
      q
        ? sections
            .map((s) => ({ ...s, lessons: s.lessons.filter((l) => l.title.toLocaleLowerCase().includes(q) || s.title.toLocaleLowerCase().includes(q)) }))
            .filter((s) => s.lessons.length > 0)
        : sections,
    [q, sections],
  );

  const isOpen = (slug: string) => (q ? true : (toggled[slug] ?? slug === current));

  return (
    <div className="flex min-h-0 flex-col">
      <label className="relative block">
        <span className="sr-only">{labels.filter}</span>
        <svg aria-hidden="true" viewBox="0 0 24 24" className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-fg-subtle" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={labels.filter}
          className="h-10 w-full rounded-xl border border-border bg-bg pr-3 pl-9 text-base outline-none transition-colors placeholder:text-fg-subtle focus:border-accent focus:ring-2 focus:ring-accent-soft lg:h-9 lg:text-sm"
        />
      </label>

      <ul className="mt-3 space-y-1">
        {visible.map((section) => {
          const open = isOpen(section.slug);
          const panelId = `${baseId}-${section.slug}`;
          const done = section.lessons.filter((l) => data.done.includes(`${section.slug}/${l.slug}`)).length;
          const total = sections.find((s) => s.slug === section.slug)?.lessons.length ?? section.lessons.length;
          const active = section.slug === current;
          return (
            <li key={section.slug}>
              <button
                type="button"
                aria-expanded={open}
                aria-controls={panelId}
                onClick={() => setToggled((t) => ({ ...t, [section.slug]: !open }))}
                className={`flex min-h-10 w-full items-center gap-2 rounded-lg px-2.5 text-left text-[0.9rem] font-semibold transition-colors hover:bg-surface-2 ${active ? "text-fg" : "text-fg-muted"}`}
              >
                <svg aria-hidden="true" viewBox="0 0 24 24" className={`size-3.5 shrink-0 text-fg-subtle transition-transform duration-200 motion-reduce:transition-none ${open ? "rotate-90" : ""}`} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m9 6 6 6-6 6" />
                </svg>
                <span className="min-w-0 flex-1 py-1.5 leading-snug">{section.title}</span>
                <span className={`shrink-0 rounded-md px-1.5 py-0.5 font-mono text-[0.68rem] font-medium ${done === total && total > 0 ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300" : "text-fg-subtle"}`}>
                  {done}/{total}
                </span>
              </button>

              <div id={panelId} hidden={!open} className="pt-0.5 pb-2">
                <NavLink
                  href={`/learn/${section.slug}`}
                  className="ml-[1.1rem] block rounded-md px-3 py-1.5 text-[0.8rem] text-fg-subtle hover:text-fg"
                  activeClassName="!text-accent"
                >
                  {labels.overview}
                </NavLink>
                <ol className="ml-[1.1rem] border-l border-border">
                  {section.lessons.map((lesson) => {
                    const id = `${section.slug}/${lesson.slug}`;
                    const learned = data.done.includes(id);
                    return (
                      <li key={lesson.slug}>
                        <NavLink
                          href={`/learn/${id}`}
                          className="-ml-px flex items-start gap-2 border-l-2 border-transparent py-1.5 pr-2 pl-3 text-[0.86rem] leading-snug text-fg-muted transition-colors hover:border-fg-subtle hover:text-fg"
                          activeClassName="!border-accent !bg-accent-soft !text-accent font-medium rounded-r-lg"
                        >
                          <span className="min-w-0 flex-1">{lesson.title}</span>
                          {learned && (
                            <svg aria-label="✓" viewBox="0 0 24 24" className="mt-0.5 size-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M4 12.5 9 17.5 20 6.5" />
                            </svg>
                          )}
                        </NavLink>
                      </li>
                    );
                  })}
                </ol>
              </div>
            </li>
          );
        })}
      </ul>
      {visible.length === 0 && <p className="mt-4 px-2.5 text-sm text-fg-subtle">{labels.noMatches}</p>}
    </div>
  );
}
