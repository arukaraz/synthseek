"use client";

import { TrackStatusIndicator } from "@components/ui/TrackStatusIndicator";
import { isRetryableStatus } from "@utils/status-helpers";
import { formatTrackDuration } from "@utils/formatters";
import { Download, Loader2, RotateCcw } from "lucide-react";
import { useTranslation } from "react-i18next";

import { formatStat } from "../../helpers";
import {
  trackArtist,
  trackDownloadButton,
  trackInfo,
  trackMeta,
  trackRank,
  trackRetryButton,
  trackRow,
  trackStatusCell,
  trackStatusReveal,
  trackTitle,
} from "../../styles";
import type { TrackRowProps } from "./types";

export function TrackRow({ track, rank, showArtist, onRequest, onRetry, isRetrying }: TrackRowProps) {
  const { t } = useTranslation("contentDetail");
  const canRetry = !!track.requestId && !!track.status && isRetryableStatus(track.status);

  return (
    <li className={trackRow()}>
      <span className={trackRank()}>{rank}</span>

      <div className={trackInfo()}>
        <span className={trackTitle()}>{track.title}</span>
        {showArtist ? <span className={trackArtist()}>{track.artist}</span> : null}
      </div>

      <div className={trackMeta()}>
        {track.plays !== null ? (
          <span>{t("trackPlays", { count: track.plays, plays: formatStat(track.plays) })}</span>
        ) : null}
        <span>{formatTrackDuration(track.durationMs)}</span>
      </div>

      <div className={trackStatusCell()}>
        {track.status ? (
          <>
            <span className={canRetry ? trackStatusReveal() : "flex items-center"}>
              <TrackStatusIndicator status={track.status} failureReason={track.failureReason} />
            </span>
            {canRetry ? (
              <button
                type="button"
                className={trackRetryButton()}
                onClick={onRetry}
                disabled={isRetrying}
                aria-label={t("retryTrack", { title: track.title })}
              >
                {isRetrying ? (
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                ) : (
                  <RotateCcw className="size-4" aria-hidden />
                )}
              </button>
            ) : null}
          </>
        ) : (
          <button
            type="button"
            className={trackDownloadButton()}
            onClick={onRequest}
            aria-label={t("requestTrack", { title: track.title })}
          >
            <Download className="size-4" aria-hidden />
          </button>
        )}
      </div>
    </li>
  );
}
