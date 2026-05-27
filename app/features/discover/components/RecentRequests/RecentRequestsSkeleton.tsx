"use client";

import { skeletonCell, skeletonStrip } from "./styles";

const SKELETON_CELLS = 5;

export function RecentRequestsSkeleton() {
  return (
    <div className={skeletonStrip()}>
      {Array.from({ length: SKELETON_CELLS }).map((_, i) => (
        <div key={i} className={skeletonCell()}>
          <div className="flex items-center justify-between">
            <div className="bg-fg/10 h-3 w-12 rounded" />
            <div className="bg-fg/10 h-4 w-16 rounded" />
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-fg/10 h-12 w-12 rounded-md" />
            <div className="min-w-0 flex-1 space-y-2">
              <div className="bg-fg/10 h-3.5 w-3/4 rounded" />
              <div className="bg-fg/10 h-3 w-1/2 rounded" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
