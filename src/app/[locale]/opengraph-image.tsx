import { hasLocale } from "next-intl";
import { routing } from "@/i18n/routing";
import { ogImage, ogMessages, ogSize } from "@/lib/og";
import { site } from "@/lib/site";

export const alt = site.name;
export const size = ogSize;
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const m = ogMessages(hasLocale(routing.locales, locale) ? locale : routing.defaultLocale);
  return ogImage({ eyebrow: m.Site.short, title: m.Site.tagline, footer: m.Site.ogFooter });
}
