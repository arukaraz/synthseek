"use client";

import { MAX_RESULTS_DISPLAY } from "./helpers";
import { SkeletonGrid } from "./SkeletonGrid";

export function SkeletonSection() {
  return (
    <div>
      <div className="bg-fg/10 mb-4 h-7 w-32 animate-pulse rounded" />
      <SkeletonGrid count={MAX_RESULTS_DISPLAY} />
    </div>
  );
}
