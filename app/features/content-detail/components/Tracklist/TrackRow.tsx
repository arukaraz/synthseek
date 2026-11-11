"use client";

import { RequestSplitButton } from "@components/RequestSplitButton";
import { Checkbox } from "@components/ui/Checkbox";
import { PreviewButton, PreviewStateLabel, PreviewTime } from "@components/ui/PreviewButton";
import { catalogPreviewClip, useTrackPreview } from "@hooks/ui/trackPreview";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@components/ui/Tooltip";
import { TrackStatusIndicator } from "@components/TrackStatusIndicator";
import { isRetryableStatus } from "@utils/status-helpers";
import { formatTrackDuration } from "@utils/formatters";
import { Loader2, RotateCcw } from "lucide-react";
import { useTranslation } from "react-i18next";

import { formatPlays, isRemovableTrack } from "../../helpers";
import {
  trackArtist,
  trackArtistLink,
  trackInfo,
  trackMeta,
  trackRetryButton,
  trackRow,
  trackSelectCell,
  trackStatusCell,
  trackStatusIcon,
  trackTime,
  trackTitle,
} from "../../styles";
import { TrackPlaybackActions } from "./TrackPlaybackActions";
import type { TrackRowProps } from "./types";

export function TrackRow({
  track,
  showArtist,
  onRequest,
  onCustomizeRequest,
  onRetry,
  isRetrying,
  selectable = false,
  isSelected = false,
  onSelectTrack,
  onPreviewHover,
  previewTone = "none",
  onPlayNow,
  onTogglePlay,
  onEnqueue,
  onRemoveFromQueue,
  queuePresence = "absent",
  onArtistNavigate,
}: TrackRowProps) {
  const { t } = useTranslation("contentDetail");
  const { t: tStatus } = useTranslation("status");
  const preview = useTrackPreview(catalogPreviewClip(track.externalId, track.title));
  const canRetry = !!track.requestId && !!track.status && isRetryableStatus(track.status);
  const showCheckbox = selectable && isRemovableTrack(track);

  return (
    <li
      className={trackRow({ previewing: preview.active })}
      data-range-preview={previewTone === "none" ? undefined : previewTone}
    >
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

      <PreviewButton
        title={track.title}
        status={preview.status}
        clock={preview.clock}
        available={track.hasPreview}
        onToggle={preview.toggle}
      />

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
            onTogglePlay={onTogglePlay}
            onEnqueue={onEnqueue}
            onRemove={onRemoveFromQueue}
          />
        ) : null}
        {track.plays !== null ? (
          <span>{t("trackPlays", { count: track.plays, plays: formatPlays(track.plays) })}</span>
        ) : null}
        {preview.clock ? (
          <span className={trackTime({ tone: "previewing" })}>
            <PreviewTime clock={preview.clock} />
          </span>
        ) : preview.status === "error" ? (
          <span className={trackTime({ tone: "failed" })}>
            <PreviewStateLabel state="failed" />
          </span>
        ) : track.hasPreview ? (
          <span className={trackTime()}>{formatTrackDuration(track.durationMs)}</span>
        ) : (
          <span className={trackTime()}>
            <PreviewStateLabel state="none" />
          </span>
        )}
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
          <RequestSplitButton
            name={track.title}
            size="sm"
            tone="ghost"
            onRequest={onRequest}
            onCustomize={onCustomizeRequest}
            dataCy="track-request"
          />
        )}
      </div>
    </li>
  );
}
