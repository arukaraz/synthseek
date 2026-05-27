"use client";

import { skeletonCanvas, skeletonContent } from "./styles";

export function TrendingHeroSkeleton() {
  return (
    <div className={skeletonCanvas()}>
      <div className={skeletonContent()}>
        <div className="bg-fg/10 h-3 w-24 rounded" />
        <div className="bg-fg/10 h-8 w-3/4 rounded" />
        <div className="bg-fg/10 h-4 w-1/3 rounded" />
        <div className="bg-fg/10 mt-3 h-9 w-28 rounded-md" />
      </div>
    </div>
  );
}
