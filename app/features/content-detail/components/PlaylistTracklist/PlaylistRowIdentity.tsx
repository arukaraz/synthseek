"use client";

import { useTranslation } from "react-i18next";

import { trackArtist, trackArtistLink } from "../../styles";
import { TrackCoverPlay } from "../TrackCoverPlay";
import { playlistRowInfo, playlistRowNumber, playlistRowTitle } from "./styles";
import type { PlaylistRowIdentityProps } from "./types";

export function PlaylistRowIdentity({
  track,
  position,
  presence,
  onPlay,
  onTogglePlay,
  onArtistNavigate,
}: PlaylistRowIdentityProps) {
  const { t } = useTranslation("contentDetail");
  const current = presence === "playing" || presence === "paused";

  return (
    <>
      <span className={playlistRowNumber({ current })}>{position + 1}</span>
      <TrackCoverPlay
        title={track.title}
        cover={track.album?.cover ?? null}
        presence={presence}
        onPlay={onPlay}
        onTogglePlay={onTogglePlay}
      />
      <div className={playlistRowInfo()}>
        <span className={playlistRowTitle({ current })}>{track.title}</span>
        {onArtistNavigate ? (
          <button
            type="button"
            className={trackArtistLink()}
            onClick={onArtistNavigate}
            aria-label={t("viewArtist", { name: track.artist })}
          >
            {track.artist}
          </button>
        ) : (
          <span className={trackArtist()}>{track.artist}</span>
        )}
      </div>
    </>
  );
}
