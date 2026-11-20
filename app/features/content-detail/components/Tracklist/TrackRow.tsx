"use client";

import { RequestSplitButton } from "@components/RequestSplitButton";
import { PreviewButton, PreviewStateLabel, PreviewTime } from "@components/ui/PreviewButton";
import { catalogPreviewClip, useTrackPreview } from "@hooks/ui/trackPreview";
import { formatTrackDuration } from "@utils/formatters";
import { useTranslation } from "react-i18next";

import { formatPlays } from "../../helpers";
import {
  trackArtist,
  trackArtistLink,
  trackInfo,
  trackMeta,
  trackRow,
  trackStatusCell,
  trackTime,
  trackTitle,
} from "../../styles";
import { TrackPlaybackActions } from "./TrackPlaybackActions";
import { TrackStatusMark } from "./TrackStatusMark";
import type { TrackRowProps } from "./types";

export function TrackRow({
  track,
  showArtist,
  onRequest,
  onCustomizeRequest,
  onRetry,
  isRetrying,
  onPlayNow,
  onTogglePlay,
  onEnqueue,
  onRemoveFromQueue,
  queuePresence = "absent",
  previewSlot,
  onArtistNavigate,
}: TrackRowProps) {
  const { t } = useTranslation("contentDetail");
  const preview = useTrackPreview(catalogPreviewClip(track.externalId, track.title, previewSlot));

  return (
    <li className={trackRow({ previewing: preview.active })}>
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
          <TrackStatusMark
            title={track.title}
            status={track.status}
            failureReason={track.failureReason}
            canRetry={!!track.requestId}
            onRetry={onRetry}
            isRetrying={isRetrying}
          />
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
