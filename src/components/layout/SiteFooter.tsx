import { getTranslations } from "next-intl/server";
import { handbook } from "@/content/handbook";
import { LogoMark } from "@/components/Logo";
import { Link } from "@/i18n/navigation";

export async function SiteFooter() {
  const t = await getTranslations();

  return (
    <footer className="mt-16 border-t border-border">
      <div className="mx-auto flex max-w-7xl flex-wrap items-start justify-between gap-6 px-4 py-10 text-sm text-fg-muted">
        <div>
          <p className="flex items-center gap-2 font-semibold text-fg">
            <LogoMark className="size-6" />
            {t("Site.name")}
          </p>
          <p className="mt-2 max-w-md leading-relaxed">{t("Footer.note")}</p>
        </div>
        <nav aria-label="Footer" className="-mx-2 flex flex-wrap gap-x-2 gap-y-1">
          <Link href="/learn" className="inline-flex min-h-10 items-center px-2 hover:text-fg">{t("Nav.learn")}</Link>
          <Link href="/review" className="inline-flex min-h-10 items-center px-2 hover:text-fg">{t("Nav.review")}</Link>
          <Link href="/resources" className="inline-flex min-h-10 items-center px-2 hover:text-fg">{t("Nav.resources")}</Link>
          {handbook.map((h) => (
            <Link key={h.href} href={h.href} className="inline-flex min-h-10 items-center px-2 hover:text-fg">{t(`Nav.${h.key}`)}</Link>
          ))}
          <Link href="/glossary" className="inline-flex min-h-10 items-center px-2 hover:text-fg">{t("Nav.glossary")}</Link>
        </nav>
      </div>
    </footer>
  );
}
