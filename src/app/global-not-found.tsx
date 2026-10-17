import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

// Rendered for URLs that never match the `[locale]` root layout (e.g. an
// unknown locale), so it cannot use next-intl and shows both languages.
export const metadata: Metadata = {
  title: "404 — Under the Hood",
};

export default function GlobalNotFound() {
  return (
    <html lang="en">
      <body className="grid min-h-dvh place-items-center bg-bg p-6 text-center font-sans text-fg">
        <main>
          <p className="font-mono text-sm text-accent">404</p>
          <h1 className="mt-2 text-[1.75rem] font-semibold tracking-tight">Page not found</h1>
          <p lang="uz" className="mt-1 text-fg-muted">Sahifa topilmadi</p>
          <p className="mt-8 flex justify-center gap-3 text-sm font-semibold">
            <Link href="/uz" lang="uz" className="rounded-md border border-border px-4 py-2">Oʻzbekcha</Link>
            <Link href="/en" lang="en" className="rounded-md border border-border px-4 py-2">English</Link>
          </p>
        </main>
      </body>
    </html>
  );
}
