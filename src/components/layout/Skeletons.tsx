/**
 * Placeholders shown while URL-dependent content (`params`) resolves. They
 * contain no data, so they belong to the static App Shell and appear the moment
 * a link is clicked; the real page streams in right after.
 */

const bar = "rounded-md bg-surface-2 motion-safe:animate-pulse";

export function LessonSkeleton() {
  return (
    <div aria-busy="true" className="max-w-3xl">
      <div className={`${bar} h-4 w-56`} />
      <div className={`${bar} mt-5 h-9 w-3/4`} />
      <div className={`${bar} mt-4 h-5 w-full`} />
      <div className={`${bar} mt-2 h-5 w-2/3`} />
      <div className={`${bar} mt-12 h-7 w-32`} />
      <div className="mt-5 space-y-3">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className={`${bar} h-4 ${i % 3 === 2 ? "w-4/5" : "w-full"}`} />
        ))}
      </div>
      <div className={`${bar} mt-10 h-64 w-full rounded-xl`} />
    </div>
  );
}

export function SectionSkeleton() {
  return (
    <div aria-busy="true">
      <div className={`${bar} h-9 w-72 max-w-full`} />
      <div className={`${bar} mt-4 h-5 w-full max-w-2xl`} />
      <ol className="mt-10 space-y-3">
        {Array.from({ length: 6 }, (_, i) => (
          <li key={i} className={`${bar} h-20 w-full rounded-xl`} />
        ))}
      </ol>
    </div>
  );
}
