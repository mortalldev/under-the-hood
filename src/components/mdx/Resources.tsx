import { getTranslations } from "next-intl/server";
import { resourcesFor, type Resource } from "@/content/resources";

export async function Resources({ topic, limit = 8 }: { topic: string; limit?: number }) {
  const t = await getTranslations("Resources");
  const list = resourcesFor(topic).slice(0, limit);
  if (list.length === 0) return null;
  return <ResourceList items={list} t={t} />;
}

type T = Awaited<ReturnType<typeof getTranslations<"Resources">>>;

export function ResourceList({ items, t }: { items: Resource[]; t: T }) {
  return (
    <ul className="not-prose my-6 grid gap-2 sm:grid-cols-2">
      {items.map((r) => (
        <li key={r.id}>
          <a
            href={r.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-full flex-col rounded-xl border border-border bg-surface-1 p-4 transition-colors hover:border-accent/50 hover:bg-surface-2/60"
          >
            <span className="text-sm font-semibold leading-snug">
              {r.title}
              <span aria-hidden="true" className="ml-1 text-fg-subtle">↗</span>
            </span>
            {r.author && <span className="mt-0.5 text-xs text-fg-muted">{r.author}</span>}
            <span className="mt-2 flex flex-wrap gap-1 text-[0.7rem]">
              <Chip>{t(`kind.${r.kind}`)}</Chip>
              <Chip tone={r.access === "free" ? "good" : r.access === "paid" ? "warn" : undefined}>{t(r.access)}</Chip>
              <Chip>{t(`level.${r.level}`)}</Chip>
              <Chip>{r.language.toUpperCase()}</Chip>
            </span>
            <span className="mt-2 text-[0.65rem] text-fg-subtle">{t("verified", { date: r.lastVerified })}</span>
          </a>
        </li>
      ))}
    </ul>
  );
}

function Chip({ children, tone }: { children: React.ReactNode; tone?: "good" | "warn" }) {
  return (
    <span
      className={`rounded-full px-2 py-0.5 ${tone === "good" ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300" : tone === "warn" ? "bg-amber-500/15 text-amber-700 dark:text-amber-300" : "bg-surface-2 text-fg-muted"}`}
    >
      {children}
    </span>
  );
}
