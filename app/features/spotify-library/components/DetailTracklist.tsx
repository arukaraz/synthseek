"use client";

import { cn } from "@utils/cn";

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
  return (
    <div className={cn(detailSection(), "border-b-0")}>
      <h3 className={detailSectionTitle()}>
        Tracklist preview <span className={detailSectionTitleLine()} />
        {totalTracks > 0 && preview.length > 0 && (
          <span className="text-fg/40 text-[10px] tracking-normal normal-case">
            first {preview.length} of {totalTracks}
          </span>
        )}
      </h3>
      <div className={trackList()}>
        {preview.length === 0 ? (
          <div className="text-fg/40 py-3 text-center text-xs">No tracks to preview.</div>
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
          View all {totalTracks} tracks →
        </a>
      )}
    </div>
  );
}
