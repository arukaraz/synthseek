"use client";

import { SKELETON_CELLS } from "./constants";
import { requestsBody, requestsList, skeletonCell } from "./styles";
import type { RecentRequestsSkeletonProps } from "./types";

export function RecentRequestsSkeleton({ layout }: RecentRequestsSkeletonProps) {
  return (
    <div className={requestsBody()}>
      <div className={requestsList({ layout })}>
        {Array.from({ length: SKELETON_CELLS }).map((_, i) => (
          <div key={i} className={skeletonCell({ layout })} />
        ))}
      </div>
    </div>
  );
}
