"use client";

import { RequestStatus } from "@api/__generated__/types";
import { TrackRetrySchedule } from "@components/TrackRetrySchedule";
import { TrackStatusIndicator } from "@components/TrackStatusIndicator";
import { useTrackRelease } from "@hooks/api/queries/useActiveReleases";

import { trackProvenance } from "./helpers";
import { trackStatusIndicator, trackStatusLine, trackStatusPercent } from "./styles";
import { TrackSourceInfo } from "./TrackSourceInfo";
import type { TrackStatusCellProps } from "./types";

export function TrackStatusCell({ track }: TrackStatusCellProps) {
  const release = useTrackRelease(track.id);
  const isFailed = track.status === RequestStatus.enum.failed;
  const isDownloading = track.status === RequestStatus.enum.downloading;
  const isWaitingOnClient = release?.state === "queued" && isDownloading;
  const percent = release?.state === "fetching" && isDownloading ? release.percent : null;
  const provenance = trackProvenance(track, release);

  return (
    <div className={trackStatusLine()}>
      <TrackStatusIndicator
        status={isWaitingOnClient ? RequestStatus.enum.pending_download : track.status}
        failureReason={track.failure_reason}
        className={trackStatusIndicator()}
      />
      {percent !== null ? <span className={trackStatusPercent()}>{percent}%</span> : null}
      {isFailed ? (
        <TrackRetrySchedule
          nextRetryAt={track.watch_enabled ? track.next_retry_at : null}
          retryCount={track.retry_count}
          compact
        />
      ) : null}
      {provenance !== null ? <TrackSourceInfo provenance={provenance} /> : null}
    </div>
  );
}
