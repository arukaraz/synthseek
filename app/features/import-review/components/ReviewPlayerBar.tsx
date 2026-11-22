"use client";

import { useTranslation } from "react-i18next";

import { PreviewAudition } from "@components/ui/PreviewButton";
import { useDownloadSourceLabel } from "@hooks/ui/useDownloadSourceLabel";

import { REVIEW_UNKNOWN_LENGTH } from "../constants";
import { heldFileClip } from "../helpers";
import { playerBar, playerNow, playerSource } from "../styles";
import type { ReviewPlayerBarProps } from "../types";

export function ReviewPlayerBar({ item }: ReviewPlayerBarProps) {
  const { t } = useTranslation("requests");
  const sourceLabel = useDownloadSourceLabel();
  const trackLabel = t("review.trackDisplay", { title: item.track.title, artist: item.track.artist });

  return (
    <div className={playerBar()}>
      <p className={playerNow()} title={item.originalFilename}>
        {trackLabel}
        <span className={playerSource()}>
          {" · "}
          {sourceLabel(item.source)}
          {" · "}
          {item.originalFilename}
        </span>
      </p>
      <PreviewAudition clip={heldFileClip(item.id, trackLabel)} idleLabel={REVIEW_UNKNOWN_LENGTH} />
    </div>
  );
}
