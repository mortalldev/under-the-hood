"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

export function LocaleSwitcher() {
  const current = useLocale();
  const pathname = usePathname();
  const t = useTranslations();

  return (
    <nav aria-label={t("Nav.language")} className="flex rounded-md border border-border p-0.5 text-xs font-medium">
      {routing.locales.map((locale) => {
        const active = locale === current;
        return (
          <Link
            key={locale}
            href={pathname}
            locale={locale}
            hrefLang={locale}
            lang={locale}
            aria-current={active ? "true" : undefined}
            aria-label={t("Nav.switchTo", { language: t(`Languages.${locale}`) })}
            className={
              active
                ? "inline-flex h-8 items-center rounded bg-fg px-2.5 text-bg"
                : "inline-flex h-8 items-center rounded px-2.5 text-fg-muted hover:text-fg"
            }
          >
            {locale.toUpperCase()}
          </Link>
        );
      })}
    </nav>
  );
}
