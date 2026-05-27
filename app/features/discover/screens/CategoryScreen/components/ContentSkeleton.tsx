"use client";

export function ContentSkeleton() {
  return (
    <div className="grid-responsive-results">
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} className="bg-fg/5 aspect-square overflow-hidden rounded-lg">
          <div className="from-fg/10 to-fg/5 h-full w-full animate-pulse bg-linear-to-br" />
        </div>
      ))}
    </div>
  );
}
