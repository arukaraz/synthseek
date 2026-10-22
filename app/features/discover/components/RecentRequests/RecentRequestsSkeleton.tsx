"use client";

import { SKELETON_CELLS } from "./constants";
import { requestsBody, requestsList, skeletonCell } from "./styles";

export function RecentRequestsSkeleton() {
  return (
    <div className={requestsBody()}>
      <div className={requestsList()}>
        {Array.from({ length: SKELETON_CELLS }).map((_, i) => (
          <div key={i} className={skeletonCell()} />
        ))}
      </div>
    </div>
  );
}
