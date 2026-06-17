"use client";

import { TrackStatusIndicator } from "@components/ui/TrackStatusIndicator";
import { formatTrackDuration } from "@utils/formatters";
import { Download } from "lucide-react";
import { useTranslation } from "react-i18next";

import { formatStat } from "../../helpers";
import { trackArtist, trackInfo, trackMeta, trackRank, trackRow, trackStatusCell, trackTitle } from "../../styles";
import type { TrackRowProps } from "./types";

export function TrackRow({ track, rank, showArtist }: TrackRowProps) {
  const { t } = useTranslation("contentDetail");

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
          <TrackStatusIndicator status={track.status} failureReason={track.failureReason} />
        ) : (
          <Download className="text-fg/30 size-4" aria-hidden />
        )}
      </div>
    </li>
  );
}
