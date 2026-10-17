/**
 * Site identity used by metadata, the sitemap, robots.txt and JSON-LD.
 * Set NEXT_PUBLIC_SITE_URL in Vercel (Project → Settings → Environment
 * Variables) when you attach a custom domain; the default is the Vercel
 * subdomain this project is meant to be deployed under.
 */
export const site = {
  name: "Under the Hood",
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "https://underthehood-uz.vercel.app").replace(/\/$/, ""),
  /** Brand colour (the light-theme accent), as hex for places that need it. */
  color: "#3b60bb",
} as const;
