"use client";

import { formatTrackDuration } from "@utils/formatters";
import { useTranslation } from "react-i18next";

import { matchConfidence } from "../helpers";
import {
  confidenceBadge,
  statusChip,
  trackArtist,
  trackChips,
  trackInfo,
  trackMeta,
  trackRow,
  trackThumb,
  trackThumbFallback,
  trackTitle,
} from "../styles";
import type { TrackCoverageRowProps } from "../types";

export function TrackCoverageRow({ track, selected, onToggle }: TrackCoverageRowProps) {
  const { t } = useTranslation("library");
  const confidence = matchConfidence(track.method);
  const statusVariant = !track.matched ? "unmatched" : track.alreadyInLibrary ? "already" : "matched";
  const statusText = !track.matched
    ? t("jspfImport.track.notFound")
    : track.alreadyInLibrary
      ? t("jspfImport.track.inLibrary")
      : t("jspfImport.track.willDownload");

  return (
    <div className={trackRow()}>
      <input
        type="checkbox"
        className="accent-primary-500 size-4 shrink-0 cursor-pointer"
        checked={selected}
        disabled={!track.matched}
        onChange={onToggle}
        aria-label={t("jspfImport.track.selectAria", { title: track.title })}
      />
      {track.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={track.image} alt="" loading="lazy" className={trackThumb()} />
      ) : (
        <div className={trackThumbFallback()} aria-hidden="true" />
      )}
      <div className={trackInfo()}>
        <span className={trackTitle()}>{track.title}</span>
        <span className={trackArtist()}>{track.artist}</span>
      </div>
      <span className={trackMeta()}>{formatTrackDuration(track.durationMs)}</span>
      <div className={trackChips()}>
        {confidence === "approx" ? (
          <span className={confidenceBadge({ kind: "approx" })}>{t("jspfImport.track.approxMatch")}</span>
        ) : null}
        {confidence === "exact" ? (
          <span className={confidenceBadge({ kind: "exact" })}>{t("jspfImport.track.exactMatch")}</span>
        ) : null}
        <span className={statusChip({ status: statusVariant })}>{statusText}</span>
      </div>
    </div>
  );
}
