"use client";

import { RequestStatus } from "@api/__generated__/types";
import { useTranslation } from "react-i18next";

import {
  explicitMark,
  trackArtistLine,
  trackInlineStatus,
  trackTitleButton,
  trackTitleLabel,
  trackTitleText,
} from "./styles";
import { TrackStatusCell } from "./TrackStatusCell";
import type { TrackTitleCellProps } from "./types";

export function TrackTitleCell({ track, expanded, onToggle }: TrackTitleCellProps) {
  const { t } = useTranslation("requests");
  const tone =
    track.status === RequestStatus.enum.complete
      ? "done"
      : track.status === RequestStatus.enum.failed || track.status === RequestStatus.enum.cancelled
        ? "muted"
        : "default";

  return (
    <div className="min-w-0">
      <button type="button" className={trackTitleButton()} aria-expanded={expanded} onClick={onToggle}>
        <span className={trackTitleText({ tone })}>
          <span className={trackTitleLabel()}>{track.title}</span>
          {track.explicit ? (
            <span className={explicitMark()} title={t("tracks.explicit")}>
              E
            </span>
          ) : null}
        </span>
        <span className={trackArtistLine()}>{track.credited_artist}</span>
      </button>
      <div className={trackInlineStatus()}>
        <TrackStatusCell track={track} />
      </div>
    </div>
  );
}
