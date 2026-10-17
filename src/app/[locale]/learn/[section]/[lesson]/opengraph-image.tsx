import { hasLocale } from "next-intl";
import { getLesson, isSectionSlug } from "@/content/registry";
import { routing } from "@/i18n/routing";
import { ogImage, ogMessages, ogSize } from "@/lib/og";
import { site } from "@/lib/site";

export const alt = site.name;
export const size = ogSize;
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ locale: string; section: string; lesson: string }> }) {
  const { locale, section, lesson } = await params;
  const loc = hasLocale(routing.locales, locale) ? locale : routing.defaultLocale;
  const m = ogMessages(loc);
  const meta = isSectionSlug(section) ? getLesson(section, lesson) : undefined;
  if (!meta || !isSectionSlug(section)) return ogImage({ eyebrow: m.Site.short, title: m.Site.tagline, footer: m.Site.ogFooter });
  return ogImage({ eyebrow: m.Sections[section].title, title: meta.title[loc], footer: meta.summary[loc] });
}
