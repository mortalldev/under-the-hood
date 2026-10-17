"use client";

import { useLocale } from "next-intl";

/** Picks the string for the current locale: l("English", "Oʻzbekcha"). */
export function useL() {
  const locale = useLocale();
  return (en: string, uz: string) => (locale === "uz" ? uz : en);
}
