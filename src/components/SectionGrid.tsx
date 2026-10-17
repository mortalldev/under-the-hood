import { getTranslations } from "next-intl/server";
import { lessons, sectionSlugs } from "@/content/registry";
import { IntentLink } from "@/components/layout/IntentLink";

export async function SectionGrid() {
  const t = await getTranslations();

  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {sectionSlugs.map((section) => (
        <li key={section}>
          <IntentLink
            href={`/learn/${section}`}
            className="group flex h-full flex-col rounded-2xl border border-border bg-surface-1 p-6 transition-colors hover:border-accent/50"
          >
            <span className="text-lg font-semibold group-hover:text-accent">{t(`Sections.${section}.title`)}</span>
            <span className="mt-2 flex-1 text-[0.95rem] leading-relaxed text-fg-muted">
              {t(`Sections.${section}.description`)}
            </span>
            <span className="mt-4 font-mono text-xs text-fg-subtle">
              {t("Lesson.lessonsCount", { count: lessons[section].length })}
            </span>
          </IntentLink>
        </li>
      ))}
    </ul>
  );
}
