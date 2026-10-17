import { getLocale, getTranslations } from "next-intl/server";
import { glossary } from "@/content/glossary";
import { lessons, sectionSlugs } from "@/content/registry";
import { LogoMark } from "@/components/Logo";
import { Link } from "@/i18n/navigation";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { MobileMenu } from "./MobileMenu";
import { NavLink } from "./NavLink";
import { SearchPalette, type SearchItem } from "./SearchPalette";
import { ThemeToggle } from "./ThemeToggle";

export async function SiteHeader() {
  const t = await getTranslations();
  const locale = await getLocale();

  const searchItems: SearchItem[] = [
    ...sectionSlugs.flatMap((section) =>
      lessons[section]
        .map((l) => ({
          kind: "lesson" as const,
          title: l.title[locale],
          subtitle: `${t(`Sections.${section}.title`)} · ${l.summary[locale]}`,
          href: `/learn/${section}/${l.slug}`,
        })),
    ),
    ...sectionSlugs.map((section) => ({
      kind: "section" as const,
      title: t(`Sections.${section}.title`),
      subtitle: t(`Sections.${section}.description`),
      href: `/learn/${section}`,
    })),
    ...Object.entries(glossary).map(([id, g]) => ({
      kind: "term" as const,
      title: g.term,
      subtitle: g.definition[locale],
      href: `/glossary#${id}`,
    })),
  ];

  const links = [
    { href: "/learn", label: t("Nav.learn"), nested: true },
    { href: "/review", label: t("Nav.review"), nested: false },
    { href: "/resources", label: t("Nav.resources"), nested: false },
    { href: "/glossary", label: t("Nav.glossary"), nested: false },
  ];

  return (
    <header className="sticky top-0 z-30 border-b border-border/70 bg-bg/80 backdrop-blur-md backdrop-saturate-150">
      <div className="relative mx-auto flex h-14 max-w-7xl items-center gap-2 px-4 sm:gap-3">
        <Link href="/" className="flex min-h-10 shrink-0 items-center gap-2 font-semibold tracking-tight">
          <LogoMark className="size-8" />
          <span className="hidden text-[0.95rem] lg:inline">{t("Site.name")}</span>
          <span className="sr-only lg:hidden">{t("Site.name")}</span>
        </Link>

        <nav aria-label={t("Nav.primary")} className="ml-1 hidden items-center gap-0.5 text-sm md:flex">
          {links.map((l) => (
            <NavLink
              key={l.href}
              href={l.href}
              matchNested={l.nested}
              className="shrink-0 rounded-lg px-3 py-1.5 text-fg-muted transition-colors hover:bg-surface-2 hover:text-fg"
              activeClassName="!bg-accent-soft !text-accent font-medium"
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-2">
          <SearchPalette items={searchItems} />
          <LocaleSwitcher />
          <ThemeToggle />
          <MobileMenu links={links} />
        </div>
      </div>
    </header>
  );
}
