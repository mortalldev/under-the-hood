import { LibrarySidebar } from "@/components/library/LibrarySidebar";
import { gitLib } from "@/content/git/registry";

export default function GitLayout({ children }: LayoutProps<"/[locale]/git">) {
  return (
    <div className="mx-auto max-w-7xl px-4 pt-8 pb-4 lg:grid lg:grid-cols-[17.5rem_minmax(0,1fr)] lg:gap-10">
      <aside>
        <LibrarySidebar lib={gitLib} />
      </aside>
      <main className="min-w-0">{children}</main>
    </div>
  );
}
