"use client";

import { useTranslation } from "react-i18next";

import { playerActions } from "@hooks/ui/player";
import { useDownloadSourceLabel } from "@hooks/ui/useDownloadSourceLabel";

import { heldAudioUrl } from "../helpers";
import { audioPlayer, playerBar, playerNow, playerSource } from "../styles";
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
      <audio
        key={item.id}
        controls
        autoPlay
        className={audioPlayer()}
        src={heldAudioUrl(item.id)}
        onPlay={playerActions.pauseHere}
        aria-label={t("review.actions.previewLabel", { name: trackLabel })}
      />
    </div>
  );
}
