"use client";

import { useTranslations } from "next-intl";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useRouter } from "@/i18n/navigation";

export interface SearchItem {
  kind: "lesson" | "section" | "term" | "principle" | "architecture" | "git" | "tool";
  title: string;
  subtitle: string;
  href: string;
}

const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯʻʼ'’‘`]/g, "");

export function SearchPalette({ items }: { items: SearchItem[] }) {
  const t = useTranslations("Search");
  const router = useRouter();
  const dialog = useRef<HTMLDialogElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const listId = useId();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);

  const results = useMemo(() => {
    const q = norm(query.trim());
    if (!q) return items.filter((i) => i.kind !== "term").slice(0, 12);
    const words = q.split(/\s+/);
    return items
      .map((item) => {
        const title = norm(item.title);
        const hay = `${title} ${norm(item.subtitle)}`;
        if (!words.every((w) => hay.includes(w))) return null;
        const score = (title.startsWith(q) ? 0 : title.includes(q) ? 1 : 2) + (item.kind === "lesson" ? 0 : 0.5);
        return { item, score };
      })
      .filter((x): x is { item: SearchItem; score: number } => x !== null)
      .sort((a, b) => a.score - b.score)
      .slice(0, 20)
      .map((x) => x.item);
  }, [items, query]);

  const open = () => {
    setQuery("");
    setActive(0);
    dialog.current?.showModal();
    requestAnimationFrame(() => input.current?.focus());
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (dialog.current?.open) dialog.current.close();
        else open();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const go = (item: SearchItem | undefined) => {
    if (!item) return;
    dialog.current?.close();
    router.push(item.href);
  };

  return (
    <>
      <button
        type="button"
        onClick={open}
        className="flex h-10 min-w-10 items-center justify-center gap-2 rounded-md border border-border px-2.5 text-sm text-fg-muted hover:bg-surface-2 hover:text-fg"
        aria-keyshortcuts="Control+K Meta+K"
      >
        <svg aria-hidden="true" viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
        <span className="hidden lg:inline">{t("open")}</span>
        <kbd className="hidden rounded border border-border px-1 font-mono text-[0.65rem] lg:inline">⌘K</kbd>
      </button>

      <dialog
        ref={dialog}
        aria-label={t("open")}
        className="m-auto mt-2 w-[min(40rem,calc(100vw-1rem))] sm:mt-[10vh] rounded-xl border border-border bg-bg p-0 text-fg shadow-2xl backdrop:bg-black/40"
        onClick={(e) => {
          if (e.target === dialog.current) dialog.current.close();
        }}
      >
        <div className="flex items-center gap-2 border-b border-border px-3">
          <input
            ref={input}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(0);
            }}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setActive((a) => Math.min(a + 1, results.length - 1));
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setActive((a) => Math.max(a - 1, 0));
              } else if (e.key === "Enter") {
                e.preventDefault();
                go(results[active]);
              }
            }}
            placeholder={t("placeholder")}
            role="combobox"
            aria-expanded="true"
            aria-controls={listId}
            aria-activedescendant={results[active] ? `${listId}-${active}` : undefined}
            className="h-12 flex-1 bg-transparent text-base outline-none"
          />
          <button type="button" onClick={() => dialog.current?.close()} className="inline-flex h-10 items-center rounded px-3 text-xs text-fg-muted hover:bg-surface-2">
            Esc
          </button>
        </div>
        <ul id={listId} role="listbox" className="max-h-[calc(100dvh-8rem)] overflow-y-auto p-2 sm:max-h-[60vh]">
          {results.length === 0 && <li className="p-4 text-sm text-fg-muted">{t("noResults")}</li>}
          {results.map((r, i) => (
            <li
              key={r.href + r.title}
              id={`${listId}-${i}`}
              role="option"
              aria-selected={i === active}
              onMouseEnter={() => setActive(i)}
              onClick={() => go(r)}
              className={`flex cursor-pointer items-start gap-3 rounded-lg px-3 py-2 ${i === active ? "bg-accent/15" : ""}`}
            >
              <span className="mt-0.5 w-[4.6rem] shrink-0 truncate text-[0.65rem] font-medium uppercase tracking-wide text-fg-subtle">{t(r.kind)}</span>
              <span className="min-w-0">
                <span className="block text-sm font-medium">{r.title}</span>
                <span className="block truncate text-xs text-fg-muted">{r.subtitle}</span>
              </span>
            </li>
          ))}
        </ul>
      </dialog>
    </>
  );
}
