/**
 * Brand mark: a lid lifted off `< >` — looking under the hood of code.
 * The same geometry is used for the favicon (src/app/icon.svg), the Apple
 * touch icon and the Open Graph images, so every surface matches.
 */
export const LOGO_PATHS = {
  lid: "M7.5 13.5 23.5 8",
  code: "M12.5 17 9 20.5l3.5 3.5M19.5 17 23 20.5 19.5 24",
} as const;

export function LogoMark({ className = "size-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className={className}>
      <rect width="32" height="32" rx="8" className="fill-accent" />
      <path d={LOGO_PATHS.lid} className="stroke-accent-fg" strokeWidth="2.6" strokeLinecap="round" fill="none" />
      <path
        d={LOGO_PATHS.code}
        className="stroke-accent-fg"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}
