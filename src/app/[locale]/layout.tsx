import type { Metadata } from "next";
import { JetBrains_Mono, Poppins } from "next/font/google";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations } from "next-intl/server";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import { TermPositioner } from "@/components/mdx/TermPositioner";
import { routing } from "@/i18n/routing";
import { site } from "@/lib/site";
import "../globals.css";

// Poppins for reading (its latin subset includes the Uzbek ʻ, U+02BB);
// JetBrains Mono for code — tall x-height, distinct 0/O and 1/l/I.
const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const mono = JetBrains_Mono({
  variable: "--font-mono-code",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Site");
  return {
    metadataBase: new URL(site.url),
    applicationName: site.name,
    title: { default: `${t("name")} — ${t("short")}`, template: `%s · ${t("name")}` },
    description: t("description"),
    keywords: ["JavaScript", "TypeScript", "React", "Next.js", "Node.js", "algorithms", "system design", "FAANG", "interview", "dasturlash", "algoritmlar"],
    category: "education",
    creator: site.name,
    formatDetection: { telephone: false, email: false, address: false },
    openGraph: { siteName: site.name, type: "website" },
    twitter: { card: "summary_large_image" },
    robots: { index: true, follow: true },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  const t = await getTranslations("Nav");

  return (
    <html
      lang={locale}
      suppressHydrationWarning
      className={`${poppins.variable} ${mono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col font-sans">
        <NextIntlClientProvider>
          <ThemeProvider>
            <a
              href="#main"
              className="sr-only z-50 rounded-md bg-accent px-3 py-2 text-accent-fg focus:not-sr-only focus:fixed focus:left-4 focus:top-3"
            >
              {t("skipToContent")}
            </a>
            <SiteHeader />
            <div id="main" className="flex-1">
              {children}
            </div>
            <SiteFooter />
            <TermPositioner />
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
