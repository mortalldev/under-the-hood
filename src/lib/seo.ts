import type { Metadata } from "next";
import { routing, type Locale } from "@/i18n/routing";
import { site } from "@/lib/site";

/** When content last changed; used by the sitemap (a fixed date keeps it static). */
export const CONTENT_UPDATED = "2026-10-17";

const ogLocale: Record<Locale, string> = { uz: "uz_UZ", en: "en_US" };

/** `/uz/learn` style path for a locale and a locale-less path ("" for home). */
export const localePath = (locale: Locale, path: string) => `/${locale}${path}`;

/** hreflang map for a page, including x-default (the Uzbek version). */
export function languageAlternates(path: string) {
  return {
    ...Object.fromEntries(routing.locales.map((l) => [l, localePath(l, path)])),
    "x-default": localePath(routing.defaultLocale, path),
  };
}

/**
 * Per-page metadata: canonical URL, hreflang alternates and Open Graph /
 * Twitter cards. The OG image itself comes from the nearest
 * `opengraph-image.tsx` file.
 */
export function pageMetadata({
  locale,
  path,
  title,
  description,
  type = "website",
}: {
  locale: Locale;
  path: string;
  title?: string;
  description: string;
  type?: "website" | "article";
}): Metadata {
  return {
    ...(title ? { title } : {}),
    description,
    alternates: { canonical: localePath(locale, path), languages: languageAlternates(path) },
    openGraph: {
      type,
      siteName: site.name,
      locale: ogLocale[locale],
      alternateLocale: routing.locales.filter((l) => l !== locale).map((l) => ogLocale[l]),
      url: localePath(locale, path),
      ...(title ? { title } : {}),
      description,
    },
    twitter: { card: "summary_large_image", ...(title ? { title } : {}), description },
  };
}

/** Serialises JSON-LD safely for a <script> tag (no `</script>` breakouts). */
export const jsonLd = (data: object) => JSON.stringify(data).replace(/</g, "\\u003c");
