"use client";

import { Music } from "lucide-react";
import { useTranslation } from "react-i18next";

import { ImageWithFallback } from "@components/ImageWithFallback";

import { RESULT_THUMB_PX } from "../constants";
import { lengthLabel, signedSeconds, verdictTone } from "../helpers";
import { chip, groupInfo, groupTitle, resultImage, resultLength, resultLine, resultRow, resultThumb } from "../styles";
import type { SongCandidateRowProps } from "../types";

export function SongCandidateRow({ candidate, fileDurationSeconds, picked, onPick }: SongCandidateRowProps) {
  const { t } = useTranslation("settings");
  const delta = fileDurationSeconds === null ? null : fileDurationSeconds - candidate.durationSeconds;

  return (
    <button type="button" className={resultRow({ picked })} aria-pressed={picked} onClick={onPick}>
      <span className={resultThumb()}>
        <ImageWithFallback
          src={candidate.image}
          alt=""
          width={RESULT_THUMB_PX}
          height={RESULT_THUMB_PX}
          placeholderSize="sm"
          fallbackIcon={Music}
          className={resultImage()}
        />
      </span>
      <span className={groupInfo()}>
        <span className={groupTitle()}>{candidate.title}</span>
        <span className={resultLine()}>
          <span>{candidate.artist}</span>
          <span>{candidate.albumName}</span>
        </span>
      </span>
      {candidate.verdict ? (
        <span className={chip({ tone: verdictTone(candidate.verdict) })}>
          {t(`libraryScan.review.match.verdict.${candidate.verdict}`)}
        </span>
      ) : (
        <span />
      )}
      <span className={resultLength()}>
        {lengthLabel(candidate.durationSeconds)}
        {delta === null ? null : ` · ${t("libraryScan.review.match.seconds", { value: signedSeconds(delta) })}`}
      </span>
    </button>
  );
}
