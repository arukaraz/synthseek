"use client";

import { Checkbox } from "@components/ui/Checkbox";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@components/ui/Tooltip";
import { TrackStatusIndicator } from "@components/TrackStatusIndicator";
import { isRetryableStatus } from "@utils/status-helpers";
import { formatTrackDuration } from "@utils/formatters";
import { Download, Loader2, RotateCcw } from "lucide-react";
import { useTranslation } from "react-i18next";

import { formatPlays, isRemovableTrack } from "../../helpers";
import {
  trackArtist,
  trackArtistLink,
  trackDownloadButton,
  trackInfo,
  trackMeta,
  trackRetryButton,
  trackRow,
  trackSelectCell,
  trackStatusCell,
  trackStatusIcon,
  trackTitle,
} from "../../styles";
import { TrackPlaybackActions } from "./TrackPlaybackActions";
import type { TrackRowProps } from "./types";

export function TrackRow({
  track,
  showArtist,
  onRequest,
  onRetry,
  isRetrying,
  selectable = false,
  isSelected = false,
  onSelectTrack,
  onPreviewHover,
  previewTone = "none",
  onPlayNow,
  onEnqueue,
  onRemoveFromQueue,
  queuePresence = "absent",
  onArtistNavigate,
}: TrackRowProps) {
  const { t } = useTranslation("contentDetail");
  const { t: tStatus } = useTranslation("status");
  const canRetry = !!track.requestId && !!track.status && isRetryableStatus(track.status);
  const showCheckbox = selectable && isRemovableTrack(track);

  return (
    <li className={trackRow()} data-range-preview={previewTone === "none" ? undefined : previewTone}>
      {selectable ? (
        <span
          className={trackSelectCell()}
          onMouseEnter={() => onPreviewHover?.(true)}
          onMouseLeave={() => onPreviewHover?.(false)}
          onMouseDownCapture={(event) => {
            if (event.shiftKey) event.preventDefault();
          }}
          onClickCapture={(event) => {
            if (!showCheckbox) return;
            event.preventDefault();
            onSelectTrack?.(event.shiftKey);
            const box = event.currentTarget.querySelector('[role="checkbox"]');
            if (box instanceof HTMLElement) box.focus();
          }}
        >
          {showCheckbox ? (
            <Checkbox
              checked={isSelected}
              preview={previewTone}
              aria-label={t("selectTrack", { title: track.title })}
            />
          ) : null}
        </span>
      ) : null}

      <div className={trackInfo()}>
        <span className={trackTitle()}>{track.title}</span>
        {showArtist && onArtistNavigate ? (
          <button
            type="button"
            className={trackArtistLink()}
            onClick={onArtistNavigate}
            aria-label={t("viewArtist", { name: track.artist })}
          >
            {track.artist}
          </button>
        ) : showArtist ? (
          <span className={trackArtist()}>{track.artist}</span>
        ) : null}
      </div>

      <div className={trackMeta()}>
        {onPlayNow && onEnqueue && onRemoveFromQueue ? (
          <TrackPlaybackActions
            title={track.title}
            presence={queuePresence}
            onPlayNow={onPlayNow}
            onEnqueue={onEnqueue}
            onRemove={onRemoveFromQueue}
          />
        ) : null}
        {track.plays !== null ? (
          <span>{t("trackPlays", { count: track.plays, plays: formatPlays(track.plays) })}</span>
        ) : null}
        <span>{formatTrackDuration(track.durationMs)}</span>
      </div>

      <div className={trackStatusCell()}>
        {track.status ? (
          <>
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
            <TooltipProvider delayDuration={150}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className={trackStatusIcon()}>
                    <TrackStatusIndicator status={track.status} failureReason={track.failureReason} hideLabel />
                  </span>
                </TooltipTrigger>
                <TooltipContent side="top">{tStatus(`request.${track.status}.label`)}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
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
