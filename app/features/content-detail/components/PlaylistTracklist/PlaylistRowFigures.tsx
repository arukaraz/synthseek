"use client";

import { formatTrackDuration } from "@utils/formatters";
import { useTranslation } from "react-i18next";

import { formatPlays } from "../../helpers";
import { playlistRowPlays, playlistRowTime } from "./styles";
import type { PlaylistRowFiguresProps } from "./types";

export function PlaylistRowFigures({ track }: PlaylistRowFiguresProps) {
  const { t } = useTranslation("contentDetail");

  return (
    <>
      <span className={playlistRowPlays()}>
        {track.plays ? t("trackPlays", { count: track.plays, plays: formatPlays(track.plays) }) : null}
      </span>
      <span className={playlistRowTime()}>{formatTrackDuration(track.durationMs)}</span>
    </>
  );
}
