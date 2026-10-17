import { LearnSidebar } from "@/components/layout/LearnSidebar";

export default function LearnLayout({ children }: LayoutProps<"/[locale]/learn">) {
  return (
    <div className="mx-auto max-w-7xl px-4 pt-8 lg:grid lg:grid-cols-[17.5rem_minmax(0,1fr)] lg:gap-10">
      <aside>
        <LearnSidebar />
      </aside>
      <main className="min-w-0">{children}</main>
    </div>
  );
}
