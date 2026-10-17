import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["uz", "en"],
  defaultLocale: "uz",
  localePrefix: "always",
  // Uzbek is the site's primary language: `/` always opens /uz instead of
  // guessing from the browser's Accept-Language. Users switch with UZ | EN.
  localeDetection: false,
});

export type Locale = (typeof routing.locales)[number];
