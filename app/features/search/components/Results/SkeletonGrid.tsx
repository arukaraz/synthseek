"use client";

import { MAX_RESULTS_DISPLAY } from "./helpers";
import { SkeletonCard } from "./SkeletonCard";
import type { SkeletonGridProps } from "./types";

export function SkeletonGrid({ count = MAX_RESULTS_DISPLAY }: SkeletonGridProps) {
  return (
    <div className="grid-responsive-results">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
