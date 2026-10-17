"use client";

import { useEffect, useMemo, useState } from "react";
import { Link } from "@/i18n/navigation";

export interface GlossaryItem {
  id: string;
  term: string;
  category: string;
  definition: string;
  lessons: { href: string; title: string }[];
}

interface Labels {
  search: string;
  all: string;
  usedIn: string;
  noResults: string;
  jump: string;
  /** Templates with a {n} / {count} placeholder (functions can't cross the server boundary). */
  more: string;
  count: string;
  categories: Record<string, string>;
}

const firstLetter = (term: string) => {
  const c = term.replace(/^[^\p{L}\p{N}]+/u, "").charAt(0).toUpperCase();
  return /[A-Z]/.test(c) ? c : "#";
};

/**
 * Searchable, filterable glossary: category chips, an A–Z jump bar and one
 * card per term with the lessons that use it. `/glossary#id` links (from the
 * search palette) still land on the card — filters reset when a hash is present.
 */
export function GlossaryBrowser({ items, categoryOrder, labels }: { items: GlossaryItem[]; categoryOrder: string[]; labels: Labels }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [hash, setHash] = useState("");

  useEffect(() => {
    const sync = () => setHash(decodeURIComponent(location.hash.slice(1)));
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);

  const q = query.trim().toLocaleLowerCase();
  const filtered = useMemo(
    () =>
      items.filter(
        (it) =>
          (category === "all" || it.category === category) &&
          (!q || it.term.toLocaleLowerCase().includes(q) || it.definition.toLocaleLowerCase().includes(q)),
      ),
    [items, category, q],
  );

  const groups = useMemo(() => {
    const map = new Map<string, GlossaryItem[]>();
    for (const it of filtered) {
      const l = firstLetter(it.term);
      map.set(l, [...(map.get(l) ?? []), it]);
    }
    return [...map.entries()].sort(([a], [b]) => (a === "#" ? 1 : b === "#" ? -1 : a.localeCompare(b)));
  }, [filtered]);

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const it of items) c[it.category] = (c[it.category] ?? 0) + 1;
    return c;
  }, [items]);

  const chip = (id: string, label: string, n: number) => (
    <button
      key={id}
      type="button"
      aria-pressed={category === id}
      onClick={() => setCategory(id)}
      className={`flex min-h-9 shrink-0 items-center gap-1.5 rounded-full border px-3.5 text-sm whitespace-nowrap transition-colors ${
        category === id ? "border-accent bg-accent text-accent-fg" : "border-border bg-bg text-fg-muted hover:border-fg-subtle hover:text-fg"
      }`}
    >
      {label}
      <span className={`font-mono text-[0.7rem] ${category === id ? "opacity-80" : "text-fg-subtle"}`}>{n}</span>
    </button>
  );

  return (
    <div className="mt-8">
      <div className="sticky top-14 z-10 -mx-4 border-b border-border/70 bg-bg/90 px-4 pt-3 pb-3 backdrop-blur-md">
        <label className="relative block">
          <span className="sr-only">{labels.search}</span>
          <svg aria-hidden="true" viewBox="0 0 24 24" className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-fg-subtle" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <input
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setHash("");
            }}
            placeholder={labels.search}
            className="h-11 w-full rounded-xl border border-border bg-surface-1 pr-3 pl-10 text-base outline-none transition-colors placeholder:text-fg-subtle focus:border-accent focus:ring-2 focus:ring-accent-soft"
          />
        </label>
        <div className="scroll-thin mt-3 -mb-1 flex gap-2 overflow-x-auto pb-1">
          {chip("all", labels.all, items.length)}
          {categoryOrder.filter((c) => counts[c]).map((c) => chip(c, labels.categories[c] ?? c, counts[c]))}
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-fg-subtle" aria-live="polite">
          {labels.count.replace("{count}", String(filtered.length))}
        </p>
        <nav aria-label={labels.jump} className="scroll-thin -mx-1 flex gap-0.5 overflow-x-auto px-1 sm:flex-wrap sm:overflow-visible">
          {groups.map(([letter]) => (
            <a key={letter} href={`#letter-${letter}`} className="grid size-9 shrink-0 place-items-center rounded-lg font-mono text-xs sm:size-8 text-fg-muted transition-colors hover:bg-surface-2 hover:text-fg">
              {letter}
            </a>
          ))}
        </nav>
      </div>

      {groups.length === 0 && <p className="mt-10 rounded-2xl border border-dashed border-border p-8 text-center text-fg-muted">{labels.noResults}</p>}

      {groups.map(([letter, list]) => (
        <section key={letter} aria-labelledby={`letter-${letter}`} className="mt-8">
          <h2 id={`letter-${letter}`} className="scroll-mt-44 border-b border-border pb-2 font-mono text-sm font-semibold text-fg-subtle">
            {letter}
          </h2>
          <ul className="mt-4 grid gap-3 md:grid-cols-2">
            {list.map((it) => (
              <li
                key={it.id}
                id={it.id}
                className={`flex scroll-mt-44 flex-col rounded-2xl border bg-surface-1 p-5 transition-colors ${hash === it.id ? "border-accent ring-2 ring-accent-soft" : "border-border"}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-mono text-[0.95rem] font-semibold text-fg [overflow-wrap:anywhere]">
                    <a href={`#${it.id}`} className="hover:text-accent">
                      {it.term}
                    </a>
                  </h3>
                  <span className="shrink-0 rounded-full bg-surface-2 px-2.5 py-0.5 text-[0.7rem] font-medium text-fg-muted">{labels.categories[it.category] ?? it.category}</span>
                </div>
                <p className="mt-2 flex-1 text-[0.95rem] leading-relaxed text-fg-muted">{it.definition}</p>
                {it.lessons.length > 0 && (
                  <div className="mt-4 flex flex-wrap items-center gap-1.5 border-t border-border pt-3 text-xs">
                    <span className="text-fg-subtle">{labels.usedIn}:</span>
                    {it.lessons.slice(0, 3).map((l) => (
                      <Link key={l.href} href={l.href} className="rounded-md bg-bg px-2 py-1 text-fg-muted transition-colors hover:bg-accent-soft hover:text-accent">
                        {l.title}
                      </Link>
                    ))}
                    {it.lessons.length > 3 && <span className="text-fg-subtle">{labels.more.replace("{n}", String(it.lessons.length - 3))}</span>}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
