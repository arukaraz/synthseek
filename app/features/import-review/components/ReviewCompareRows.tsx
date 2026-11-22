"use client";

import { useTranslation } from "react-i18next";

import { formatTrackDuration } from "@utils/formatters";

import { durationDelta, wordDiff } from "../helpers";
import { compareMuted, diffAdded } from "../styles";
import type { ReviewCompareRowsProps } from "../types";
import { CompareRow } from "./CompareRow";
import { DiffText } from "./DiffText";
import { SimilarityMeter } from "./SimilarityMeter";

export function ReviewCompareRows({ comparison, track }: ReviewCompareRowsProps) {
  const { t } = useTranslation("requests");

  switch (comparison.kind) {
    case "fingerprint": {
      const artist = wordDiff(track.artist, comparison.artist);
      const title = comparison.title === null ? null : wordDiff(track.title, comparison.title);
      return (
        <>
          <CompareRow
            label={t("review.compare.artist")}
            requested={<DiffText tokens={artist.requested} side="requested" />}
            found={<DiffText tokens={artist.found} side="found" />}
            differs={artist.differs}
          />
          <CompareRow
            label={t("review.compare.title")}
            requested={title ? <DiffText tokens={title.requested} side="requested" /> : track.title}
            found={
              title ? (
                <DiffText tokens={title.found} side="found" />
              ) : (
                <span className={compareMuted()}>{t("review.evidence.unknownTitle")}</span>
              )
            }
            differs={title === null || title.differs}
          />
          {comparison.score === null ? null : (
            <SimilarityMeter
              label={t("review.compare.similarity")}
              score={comparison.score}
              caption={t("review.compare.artistScore", { score: Math.round(comparison.score) })}
            />
          )}
        </>
      );
    }
    case "duration":
      return (
        <CompareRow
          label={t("review.compare.length")}
          requested={formatTrackDuration(comparison.expectedMs)}
          found={
            <>
              <mark className={diffAdded()}>{formatTrackDuration(comparison.observedMs)}</mark>{" "}
              <span className={compareMuted()}>({durationDelta(comparison.observedMs, comparison.expectedMs)})</span>
            </>
          }
          differs
        />
      );
    case "tagMatch":
      return (
        <CompareRow
          label={t("review.compare.tagMatch")}
          requested={t("review.compare.atLeast", { value: Math.round(comparison.expected) })}
          found={
            <mark className={diffAdded()}>{t("review.compare.outOf", { value: Math.round(comparison.observed) })}</mark>
          }
          differs
        />
      );
    case "unreadable":
      return (
        <CompareRow
          label={t("review.compare.tags")}
          requested={t("review.trackDisplay", { title: track.title, artist: track.artist })}
          found={<mark className={diffAdded()}>{t("review.compare.unreadable")}</mark>}
          differs
        />
      );
    case "rejected":
      return (
        <CompareRow
          label={t("review.compare.soundsLike")}
          requested={<span className={compareMuted()}>{t("review.compare.newCopy")}</span>}
          found={t("review.compare.rejectedCopy", { path: comparison.path })}
          differs
        />
      );
  }
}
