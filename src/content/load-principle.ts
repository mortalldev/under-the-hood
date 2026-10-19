import type { MDXContent } from "mdx/types";
import type { Locale } from "@/i18n/routing";

interface PrincipleModule {
  default: MDXContent;
}

export async function loadPrinciple(slug: string, locale: Locale): Promise<MDXContent> {
  const mod: PrincipleModule = await import(`./principles/${slug}/${locale}.mdx`);
  return mod.default;
}
