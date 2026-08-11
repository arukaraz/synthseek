"use client";

import { RequestStatus } from "@api/__generated__/types";
import { TrackRetrySchedule } from "@components/TrackRetrySchedule";
import { TrackStatusIndicator } from "@components/ui/TrackStatusIndicator";

import type { TrackStatusCellProps } from "./types";

export function TrackStatusCell({ track, onRetryNow }: TrackStatusCellProps) {
  const isFailed = track.status === RequestStatus.enum.failed;

  return (
    <div className="flex min-w-0 flex-col gap-0.5">
      <TrackStatusIndicator status={track.status} failureReason={track.failure_reason} />
      {isFailed ? (
        <div className="pl-4">
          <TrackRetrySchedule
            nextRetryAt={track.watch_enabled ? track.next_retry_at : null}
            retryCount={track.retry_count}
            onRetryNow={onRetryNow}
          />
        </div>
      ) : null}
    </div>
  );
}
