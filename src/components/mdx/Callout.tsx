import type { ReactNode } from "react";

type CalloutKind = "note" | "tip" | "warning" | "unverified";

const styles: Record<CalloutKind, string> = {
  note: "border-sky-500/25 bg-sky-500/[0.06] [--chip:var(--color-sky-500)]",
  tip: "border-emerald-500/25 bg-emerald-500/[0.06] [--chip:var(--color-emerald-500)]",
  warning: "border-amber-500/30 bg-amber-500/[0.07] [--chip:var(--color-amber-500)]",
  unverified: "border-rose-500/30 bg-rose-500/[0.06] [--chip:var(--color-rose-500)]",
};

const icons: Record<CalloutKind, string> = {
  note: "ℹ",
  tip: "✓",
  warning: "!",
  unverified: "?",
};

interface CalloutProps {
  kind?: CalloutKind;
  title?: string;
  children: ReactNode;
}

export function Callout({ kind = "note", title, children }: CalloutProps) {
  return (
    <aside className={`not-prose my-7 flex gap-3.5 rounded-2xl border p-4 sm:p-5 ${styles[kind]}`}>
      <span aria-hidden="true" className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-(--chip) text-xs font-bold text-white">
        {icons[kind]}
      </span>
      <div className="min-w-0 text-[0.98rem] leading-[1.7] [&>p+p]:mt-2">
        {title && <p className="mb-1 font-semibold">{title}</p>}
        {children}
      </div>
    </aside>
  );
}
