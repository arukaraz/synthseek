"use client";

import { ACTIVE_STATUSES, RequestStatus, UNRESOLVED_STATUSES } from "@api/__generated__/types";
import { RequestDetailStatsCard } from "./RequestDetailStatsCard";
import { detailStatsGrid } from "./styles";
import type { RequestDetailStatsProps } from "./types";

export function RequestDetailStats({ request }: RequestDetailStatsProps) {
  const tracks = request.tracks ?? [];
  const completeCount = tracks.filter((t) => t.status === RequestStatus.enum.complete).length;
  const failedCount = tracks.filter((t) => (UNRESOLVED_STATUSES as readonly string[]).includes(t.status)).length;
  const activeCount = tracks.filter((t) => (ACTIVE_STATUSES as readonly string[]).includes(t.status)).length;

  return (
    <div className={detailStatsGrid()}>
      <RequestDetailStatsCard
        label="Tracks"
        value={`${request.completed_tracks}/${request.total_tracks}`}
        sublabel="requested"
      />
      <RequestDetailStatsCard
        label="Complete"
        value={completeCount}
        sublabel="downloaded"
        valueClassName="text-green-400"
      />
      <RequestDetailStatsCard
        label="Failed"
        value={failedCount}
        sublabel="errored"
        valueClassName="text-red-400"
      />
      <RequestDetailStatsCard
        label="Active"
        value={activeCount}
        sublabel="in progress"
        valueClassName="text-primary-400"
      />
    </div>
  );
}
