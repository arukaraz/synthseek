"use client";

import { MAX_RESULTS_DISPLAY } from "./helpers";
import type { SkeletonGridProps } from "./types";

export function SkeletonCard() {
  return (
    <div className="bg-fg/5 overflow-hidden rounded-lg">
      <div className="from-fg/10 to-fg/5 aspect-square animate-pulse bg-gradient-to-br" />
      <div className="space-y-2 p-3">
        <div className="bg-fg/10 h-4 animate-pulse rounded" />
        <div className="bg-fg/5 h-3 w-3/4 animate-pulse rounded" />
      </div>
    </div>
  );
}

export function SkeletonGrid({ count = MAX_RESULTS_DISPLAY }: SkeletonGridProps) {
  return (
    <div className="grid-responsive-results">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

export function SkeletonSection() {
  return (
    <div>
      <div className="bg-fg/10 mb-4 h-7 w-32 animate-pulse rounded" />
      <SkeletonGrid count={MAX_RESULTS_DISPLAY} />
    </div>
  );
}
