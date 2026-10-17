import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";
import { LOGO_PATHS } from "@/components/Logo";
import type { Locale } from "@/i18n/routing";
import { site } from "@/lib/site";
import en from "@/messages/en.json";
import uz from "@/messages/uz.json";

export const ogSize = { width: 1200, height: 630 };

/**
 * Image routes are Route Handlers, where next-intl's request config (which
 * reads `next/root-params`) isn't available yet — so read the JSON directly.
 */
export const ogMessages = (locale: Locale) => (locale === "en" ? en : uz);

const fontDir = path.join(process.cwd(), "src/assets/fonts");
const fonts = Promise.all([
  readFile(path.join(fontDir, "Poppins-Regular.ttf")),
  readFile(path.join(fontDir, "Poppins-SemiBold.ttf")),
]);

// Dark-theme palette as hex: Satori (the OG renderer) doesn't parse oklch().
const c = { bg: "#161a20", surface: "#1d2229", border: "#343a43", fg: "#e2ded5", muted: "#a8aeb8", accent: "#95b6fe", brand: "#3b60bb" };

/** Shared 1200×630 social card: logo, eyebrow, big title, footer line. */
export async function ogImage({ eyebrow, title, footer }: { eyebrow: string; title: string; footer: string }) {
  const [regular, semibold] = await fonts;
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 72, background: c.bg, fontFamily: "Poppins", color: c.fg }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <svg width="64" height="64" viewBox="0 0 32 32">
            <rect width="32" height="32" rx="8" fill={c.brand} />
            <path d={LOGO_PATHS.lid} stroke="#fdfcf8" strokeWidth="2.6" strokeLinecap="round" fill="none" />
            <path d={LOGO_PATHS.code} stroke="#fdfcf8" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </svg>
          <span style={{ fontSize: 34, fontWeight: 600 }}>{site.name}</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <span style={{ fontSize: 30, color: c.accent }}>{eyebrow}</span>
          <span style={{ fontSize: title.length > 48 ? 60 : 72, fontWeight: 600, lineHeight: 1.12, letterSpacing: -1.5 }}>{title}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", borderTop: `2px solid ${c.border}`, paddingTop: 28, fontSize: 26, color: c.muted }}>
          <span style={{ maxWidth: 720, lineHeight: 1.4 }}>{footer.length > 110 ? `${footer.slice(0, 107).trimEnd()}…` : footer}</span>
          <span style={{ flexShrink: 0, whiteSpace: "nowrap", marginLeft: 32 }}>{site.url.replace(/^https?:\/\//, "")}</span>
        </div>
      </div>
    ),
    {
      ...ogSize,
      fonts: [
        { name: "Poppins", data: regular, weight: 400, style: "normal" },
        { name: "Poppins", data: semibold, weight: 600, style: "normal" },
      ],
    },
  );
}
