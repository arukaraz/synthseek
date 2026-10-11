"use client";

import { RequestStatus } from "@api/__generated__/types";
import { TrackRetrySchedule } from "@components/TrackRetrySchedule";
import { TrackStatusIndicator } from "@components/TrackStatusIndicator";

import { AcquisitionLine } from "./AcquisitionLine";
import type { TrackStatusCellProps } from "./types";

export function TrackStatusCell({ track, onRetryNow }: TrackStatusCellProps) {
  const isFailed = track.status === RequestStatus.enum.failed;
  const isComplete = track.status === RequestStatus.enum.complete;

  return (
    <div className="flex min-w-0 flex-col gap-0.5">
      <TrackStatusIndicator status={track.status} failureReason={track.failure_reason} />
      {isComplete && track.acquisition_source !== null ? (
        <AcquisitionLine
          source={track.acquisition_source}
          sourceRef={track.acquisition_ref}
          license={track.acquisition_license}
        />
      ) : null}
      {isFailed ? (
        <TrackRetrySchedule
          nextRetryAt={track.watch_enabled ? track.next_retry_at : null}
          retryCount={track.retry_count}
          onRetryNow={onRetryNow}
        />
      ) : null}
    </div>
  );
}
