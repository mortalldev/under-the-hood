import { getLocale, getTranslations } from "next-intl/server";
import { architectureLib } from "@/content/architecture/registry";
import { gitLib } from "@/content/git/registry";
import { glossary } from "@/content/glossary";
import { handbook } from "@/content/handbook";
import { entryHref } from "@/content/library";
import { principlesLib } from "@/content/principles/registry";
import { lessons, sectionSlugs } from "@/content/registry";
import { getToolCategory, tools } from "@/content/tools/registry";
import { LogoMark } from "@/components/Logo";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { HandbookMenu, type HandbookItem } from "./HandbookMenu";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { MobileMenu } from "./MobileMenu";
import { NavLink } from "./NavLink";
import { SearchPalette, type SearchItem } from "./SearchPalette";
import { ThemeToggle } from "./ThemeToggle";

export async function SiteHeader() {
  const t = await getTranslations();
  const locale = (await getLocale()) as Locale;

  const libraryItems = (kind: "principle" | "architecture" | "git", lib: typeof principlesLib | typeof architectureLib | typeof gitLib) =>
    lib.entries.map((p) => ({
      kind,
      title: p.expansion && p.expansion !== p.name ? `${p.name} — ${p.expansion}` : p.name,
      subtitle: p.tagline[locale],
      href: entryHref(lib, p),
    }));

  const searchItems: SearchItem[] = [
    ...sectionSlugs.flatMap((section) =>
      lessons[section].map((l) => ({
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
    ...libraryItems("principle", principlesLib),
    ...libraryItems("architecture", architectureLib),
    ...libraryItems("git", gitLib),
    ...tools.map((x) => ({
      kind: "tool" as const,
      title: x.name,
      subtitle: `${getToolCategory(x.category).title[locale]} · ${x.what[locale]}`,
      href: `/tools/${x.category}#${x.slug}`,
    })),
    ...Object.entries(glossary).map(([id, g]) => ({
      kind: "term" as const,
      title: g.term,
      subtitle: g.definition[locale],
      href: `/glossary#${id}`,
    })),
  ];

  const handbookItems: HandbookItem[] = handbook.map((h) => ({
    href: h.href,
    label: t(`Nav.${h.key}`),
    desc: t(`Nav.${h.key}Desc`),
    icon: h.icon,
    count: h.count,
  }));

  const linkClass = "shrink-0 rounded-lg px-3 py-1.5 text-fg-muted transition-colors hover:bg-surface-2 hover:text-fg";
  const activeClass = "!bg-accent-soft !text-accent font-medium";
  const after = [
    { href: "/review", label: t("Nav.review"), nested: false },
    { href: "/resources", label: t("Nav.resources"), nested: false },
    { href: "/glossary", label: t("Nav.glossary"), nested: false },
  ];
  const learn = { href: "/learn", label: t("Nav.learn"), nested: true };

  return (
    <header className="sticky top-0 z-30 border-b border-border/70 bg-bg/80 backdrop-blur-md backdrop-saturate-150">
      <div className="relative mx-auto flex h-14 max-w-7xl items-center gap-2 px-4 sm:gap-3">
        <Link href="/" className="flex min-h-10 shrink-0 items-center gap-2 font-semibold tracking-tight">
          <LogoMark className="size-8" />
          <span className="hidden text-[0.95rem] lg:inline">{t("Site.name")}</span>
          <span className="sr-only lg:hidden">{t("Site.name")}</span>
        </Link>

        <nav aria-label={t("Nav.primary")} className="ml-1 hidden items-center gap-0.5 text-sm md:flex">
          <NavLink href={learn.href} matchNested className={linkClass} activeClassName={activeClass}>
            {learn.label}
          </NavLink>
          <HandbookMenu label={t("Nav.handbook")} lead={t("Nav.handbookLead")} items={handbookItems} />
          {after.map((l) => (
            <NavLink key={l.href} href={l.href} matchNested={l.nested} className={linkClass} activeClassName={activeClass}>
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-2">
          <SearchPalette items={searchItems} />
          <LocaleSwitcher />
          <ThemeToggle />
          <MobileMenu links={[learn, ...after]} handbook={handbookItems} handbookLabel={t("Nav.handbook")} />
        </div>
      </div>
    </header>
  );
}
