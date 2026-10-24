import type { MDXContent } from "mdx/types";
import type { Locale } from "@/i18n/routing";
import type { LibraryId } from "./library";

interface EntryModule {
  default: MDXContent;
}

/** Dynamic MDX import of one library entry; one literal path per library so the bundler only globs that folder. */
export async function loadEntry(lib: LibraryId, slug: string, locale: Locale): Promise<MDXContent> {
  let mod: EntryModule;
  if (lib === "principles") mod = await import(`./principles/${slug}/${locale}.mdx`);
  else if (lib === "architecture") mod = await import(`./architecture/${slug}/${locale}.mdx`);
  else mod = await import(`./git/${slug}/${locale}.mdx`);
  return mod.default;
}

/** MDX body of a tools category page (`tools/<category>/<locale>.mdx`). */
export async function loadToolsPage(category: string, locale: Locale): Promise<MDXContent> {
  const mod: EntryModule = await import(`./tools/${category}/${locale}.mdx`);
  return mod.default;
}
