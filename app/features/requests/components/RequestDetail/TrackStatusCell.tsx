"use client";

import { RequestStatus } from "@api/__generated__/types";
import { TrackStatusIndicator } from "@components/TrackStatusIndicator";
import { useTrackRelease } from "@hooks/api/queries/useActiveReleases";

import { PriorityCell } from "./PriorityCell";
import { trackStatusIndicator, trackStatusLine, trackStatusPercent, trackStatusStack } from "./styles";
import { TrackRetryLine } from "./TrackRetryLine";
import type { TrackStatusCellProps } from "./types";

export function TrackStatusCell({ track }: TrackStatusCellProps) {
  const release = useTrackRelease(track.id);
  const isDownloading = track.status === RequestStatus.enum.downloading;
  const isWaitingOnClient = release?.state === "queued" && isDownloading;
  const percent = release?.state === "fetching" && isDownloading ? release.percent : null;

  return (
    <div className={trackStatusStack()}>
      <div className={trackStatusLine()}>
        <TrackStatusIndicator
          status={isWaitingOnClient ? RequestStatus.enum.pending_download : track.status}
          failureReason={track.failure_reason}
          className={trackStatusIndicator()}
        />
        {percent !== null ? <span className={trackStatusPercent()}>{percent}%</span> : null}
        {track.status === RequestStatus.enum.queued ? <PriorityCell track={track} /> : null}
      </div>
      <TrackRetryLine track={track} />
    </div>
  );
}
