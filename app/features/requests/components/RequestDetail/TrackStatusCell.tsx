"use client";

import { ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";

import { RequestStatus } from "@api/__generated__/types";
import { TrackStatusIndicator } from "@components/TrackStatusIndicator";
import { useTrackRelease } from "@hooks/api/queries/useActiveReleases";
import { openImportReview } from "@hooks/ui/useImportReviewLauncher";
import { useAuthContext } from "@modules/providers/AuthProvider";

import { PriorityCell } from "./PriorityCell";
import {
  trackReviewButton,
  trackStatusIndicator,
  trackStatusLine,
  trackStatusPercent,
  trackStatusStack,
} from "./styles";
import { TrackRetryLine } from "./TrackRetryLine";
import type { TrackStatusCellProps } from "./types";

export function TrackStatusCell({ track }: TrackStatusCellProps) {
  const { t } = useTranslation("requests");
  const { isAdmin } = useAuthContext();
  const release = useTrackRelease(track.id);
  const isDownloading = track.status === RequestStatus.enum.downloading;
  const isWaitingOnClient = release?.state === "queued" && isDownloading;
  const percent = release?.state === "fetching" && isDownloading ? release.percent : null;
  const opensReview = isAdmin && track.status === RequestStatus.enum.pending_import_review;

  const indicator = (
    <TrackStatusIndicator
      status={isWaitingOnClient ? RequestStatus.enum.pending_download : track.status}
      failureReason={opensReview ? null : track.failure_reason}
      className={trackStatusIndicator()}
    />
  );

  return (
    <div className={trackStatusStack()}>
      <div className={trackStatusLine()}>
        {opensReview ? (
          <button
            type="button"
            className={trackReviewButton()}
            aria-label={t("detail.openReviewFor", { title: track.title })}
            onClick={() => openImportReview(track.id)}
          >
            {indicator}
            <ChevronRight aria-hidden className="size-3.5 shrink-0" />
          </button>
        ) : (
          indicator
        )}
        {percent !== null ? <span className={trackStatusPercent()}>{percent}%</span> : null}
        {track.status === RequestStatus.enum.queued ? <PriorityCell track={track} /> : null}
      </div>
      <TrackRetryLine track={track} />
    </div>
  );
}
