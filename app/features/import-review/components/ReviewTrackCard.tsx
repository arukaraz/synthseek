"use client";

import { useTranslation } from "react-i18next";

import { TrackRetrySchedule } from "@components/TrackRetrySchedule";

import { reviewTrackAnchor } from "../helpers";
import { filesCount, itemTitle, trackCard, trackCardArtist, trackCardHeader } from "../styles";
import type { ReviewTrackCardProps } from "../types";
import { ReviewCandidate } from "./ReviewCandidate";

export function ReviewTrackCard({ group }: ReviewTrackCardProps) {
  const { t } = useTranslation("requests");
  const { track, items, shown } = group;
  const siblings = items.length - 1;

  return (
    <article
      className={trackCard()}
      tabIndex={-1}
      data-anchor-target={reviewTrackAnchor(track.id)}
      data-track-id={track.id}
      aria-label={t("review.trackDisplay", { title: track.title, artist: track.artist })}
    >
      <div className={trackCardHeader()}>
        <div className="min-w-0">
          <div className={itemTitle()}>{track.title}</div>
          <div className={trackCardArtist()}>{track.artist}</div>
        </div>
        {siblings > 0 ? <span className={filesCount()}>{t("review.card.files", { count: items.length })}</span> : null}
      </div>

      <TrackRetrySchedule nextRetryAt={track.nextRetryAt} retryCount={track.retryCount} />

      {shown.map((item) => (
        <ReviewCandidate key={item.id} item={item} index={items.indexOf(item)} siblings={siblings} />
      ))}
    </article>
  );
}
