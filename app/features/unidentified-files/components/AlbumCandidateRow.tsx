"use client";

import { Disc3 } from "lucide-react";
import { useTranslation } from "react-i18next";

import { ImageWithFallback } from "@components/ImageWithFallback";

import { RESULT_THUMB_PX } from "../constants";
import { displayYearAndLabel } from "../helpers";
import { chip, groupInfo, groupTitle, resultHint, resultImage, resultLine, resultRow, resultThumb } from "../styles";
import type { AlbumCandidateRowProps } from "../types";

export function AlbumCandidateRow({ candidate, picked, onPick }: AlbumCandidateRowProps) {
  const { t } = useTranslation("settings");
  const parts = [
    candidate.artist,
    ...displayYearAndLabel(candidate.year, candidate.label),
    t("libraryScan.review.match.songsCount", { count: candidate.trackCount }),
  ];

  return (
    <button type="button" className={resultRow({ picked })} aria-pressed={picked} onClick={onPick}>
      <span className={resultThumb()}>
        <ImageWithFallback
          src={candidate.image}
          alt=""
          width={RESULT_THUMB_PX}
          height={RESULT_THUMB_PX}
          placeholderSize="sm"
          fallbackIcon={Disc3}
          className={resultImage()}
        />
      </span>
      <span className={groupInfo()}>
        <span className={groupTitle()}>{candidate.name}</span>
        {candidate.suggested ? (
          <span className={resultHint()}>{t("libraryScan.review.match.pickedLastTime")}</span>
        ) : null}
        <span className={resultLine()}>
          {parts.map((part) => (
            <span key={part}>{part}</span>
          ))}
        </span>
      </span>
      <span className={chip({ tone: candidate.matched === candidate.total ? "ok" : "warn" })}>
        {t("libraryScan.review.match.matchCount", { matched: candidate.matched, total: candidate.total })}
      </span>
    </button>
  );
}
