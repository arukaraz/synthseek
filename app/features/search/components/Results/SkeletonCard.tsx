"use client";

export function SkeletonCard() {
  return (
    <div className="bg-fg/5 overflow-hidden rounded-lg">
      <div className="from-fg/10 to-fg/5 aspect-square animate-pulse bg-linear-to-br" />
      <div className="space-y-2 p-3">
        <div className="bg-fg/10 h-4 animate-pulse rounded" />
        <div className="bg-fg/5 h-3 w-3/4 animate-pulse rounded" />
      </div>
    </div>
  );
}
