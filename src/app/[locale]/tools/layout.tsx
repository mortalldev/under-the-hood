import { ToolsSidebar } from "@/components/tools/ToolsSidebar";

export default function ToolsLayout({ children }: LayoutProps<"/[locale]/tools">) {
  return (
    <div className="mx-auto max-w-7xl px-4 pt-8 pb-4 lg:grid lg:grid-cols-[17.5rem_minmax(0,1fr)] lg:gap-10">
      <aside>
        <ToolsSidebar />
      </aside>
      <main className="min-w-0">{children}</main>
    </div>
  );
}
