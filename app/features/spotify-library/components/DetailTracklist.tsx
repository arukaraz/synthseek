"use client";

import { cn } from "@utils/cn";
import { useTranslation } from "react-i18next";

import {
  detailSection,
  detailSectionTitle,
  detailSectionTitleLine,
  trackArtist,
  trackDur,
  trackList,
  trackMore,
  trackPos,
  trackRow,
  trackTitle,
} from "../styles";
import type { DetailTracklistProps } from "./types";

export function DetailTracklist({ totalTracks, preview, externalUrl, hasMore }: DetailTracklistProps) {
  const { t } = useTranslation("library");

  return (
    <div className={cn(detailSection(), "border-b-0")}>
      <h3 className={detailSectionTitle()}>
        {t("spotifyLibrary.tracklist.title")} <span className={detailSectionTitleLine()} />
        {totalTracks > 0 && preview.length > 0 && (
          <span className="text-fg/40 text-[10px] tracking-normal normal-case">
            {t("spotifyLibrary.tracklist.firstOf", { shown: preview.length, total: totalTracks })}
          </span>
        )}
      </h3>
      <div className={trackList()}>
        {preview.length === 0 ? (
          <div className="text-fg/40 py-3 text-center text-xs">{t("spotifyLibrary.tracklist.empty")}</div>
        ) : (
          preview.map((t) => (
            <div key={t.position} className={trackRow()}>
              <span className={trackPos()}>{String(t.position).padStart(2, "0")}</span>
              <span className={trackTitle()}>
                {t.title}
                <span className={trackArtist()}>{t.artist}</span>
              </span>
              <span className={trackDur()}>{t.duration}</span>
            </div>
          ))
        )}
      </div>
      {hasMore && (
        <a href={externalUrl} target="_blank" rel="noreferrer" className={trackMore()}>
          {t("spotifyLibrary.tracklist.viewAll", { total: totalTracks })}
        </a>
      )}
    </div>
  );
}
