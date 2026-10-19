import type { NextConfig } from "next";
import createMDX from "@next/mdx";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  // Files read with fs at render time must be traced into the server bundle
  // (route globs use picomatch, so `*` stands in for each dynamic segment).
  outputFileTracingIncludes: {
    "/*/learn/*/*": ["./src/content/lessons/**/*.mdx"],
    "/*/glossary": ["./src/content/lessons/**/en.mdx"],
    "/*/principles/*/*": ["./src/content/principles/**/*.mdx"],
    "/**/opengraph-image*": ["./src/assets/fonts/*.ttf"],
  },
  experimental: {
    // Renders a 404 for URLs that never reach the `[locale]` root layout.
    globalNotFound: true,
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

// Turbopack runs MDX plugins in Rust, so plugins are referenced by package
// name and their options must be JSON-serializable (no functions).
const withMDX = createMDX({
  options: {
    remarkPlugins: ["remark-gfm"],
    rehypePlugins: [
      "rehype-slug",
      [
        "@shikijs/rehype",
        {
          themes: { light: "github-light", dark: "github-dark-dimmed" },
          defaultColor: false,
        },
      ],
    ],
  },
});

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

export default withNextIntl(withMDX(nextConfig));
