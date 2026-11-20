"use client";

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@components/ui/DropdownMenu";
import { PreviewButton } from "@components/ui/PreviewButton";
import { catalogPreviewClip, useTrackPreview } from "@hooks/ui/trackPreview";
import { EllipsisVertical, ListPlus, ListStart } from "lucide-react";
import { useTranslation } from "react-i18next";

import { TrackStatusMark } from "../Tracklist";
import { PlaylistRowFigures } from "./PlaylistRowFigures";
import { PlaylistRowIdentity } from "./PlaylistRowIdentity";
import {
  playlistMenuItem,
  playlistRow,
  playlistRowHover,
  playlistRowIcon,
  playlistRowMore,
  playlistRowStatus,
} from "./styles";
import type { PlaylistTrackRowProps } from "./types";

export function PlaylistTrackRow({
  track,
  position,
  presence,
  onPlay,
  onTogglePlay,
  onPlayNext,
  onEnqueue,
  onArtistNavigate,
  onRetry,
  isRetrying,
}: PlaylistTrackRowProps) {
  const { t } = useTranslation("contentDetail");
  const { t: tPlayer } = useTranslation("player");
  const preview = useTrackPreview(catalogPreviewClip(track.externalId, track.title, position));
  const current = presence === "playing" || presence === "paused";
  const playNextLabel = tPlayer("queue.playNextTrack", { title: track.title });
  const enqueueLabel = tPlayer("queue.addTrack", { title: track.title });

  return (
    <li className={playlistRow({ current })}>
      <PlaylistRowIdentity
        track={track}
        position={position}
        presence={presence}
        onPlay={onPlay}
        onTogglePlay={onTogglePlay}
        onArtistNavigate={onArtistNavigate}
        previewSlot={
          onPlay === undefined && track.hasPreview ? (
            <PreviewButton
              title={track.title}
              status={preview.status}
              clock={preview.clock}
              available
              onToggle={preview.toggle}
              tone="cover"
            />
          ) : undefined
        }
      />

      {track.status !== null && track.status !== "complete" ? (
        <span className={playlistRowStatus()}>
          <TrackStatusMark
            title={track.title}
            status={track.status}
            failureReason={track.failureReason}
            canRetry={track.requestId !== null}
            onRetry={onRetry}
            isRetrying={isRetrying}
          />
        </span>
      ) : null}

      {onPlayNext && onEnqueue ? (
        <>
          <span className={playlistRowHover()}>
            <button
              type="button"
              className={playlistRowIcon()}
              onClick={onPlayNext}
              title={t("playNext")}
              aria-label={playNextLabel}
            >
              <ListStart className="size-4" aria-hidden />
            </button>
            <button
              type="button"
              className={playlistRowIcon()}
              onClick={onEnqueue}
              title={t("addToQueue")}
              aria-label={enqueueLabel}
            >
              <ListPlus className="size-4" aria-hidden />
            </button>
          </span>
          <span className={playlistRowMore()}>
            <DropdownMenu>
              <DropdownMenuTrigger className={playlistRowIcon()} aria-label={t("trackActions", { title: track.title })}>
                <EllipsisVertical className="size-4" aria-hidden />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem className={playlistMenuItem()} onSelect={onPlayNext}>
                  <ListStart className="size-4" aria-hidden />
                  {t("playNext")}
                </DropdownMenuItem>
                <DropdownMenuItem className={playlistMenuItem()} onSelect={onEnqueue}>
                  <ListPlus className="size-4" aria-hidden />
                  {t("addToQueue")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </span>
        </>
      ) : null}

      <PlaylistRowFigures track={track} />
    </li>
  );
}
