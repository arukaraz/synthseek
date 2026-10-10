"use client";

import { useTranslation } from "react-i18next";

import { stageChip, stageChips } from "./styles";
import type { StageChipsProps } from "./types";

export function StageChips({ view }: StageChipsProps) {
  const { t } = useTranslation("player");

  return (
    <div className={stageChips()}>
      <span
        className={stageChip({
          tone: view.chain.transcoding ? "warning" : view.track.lossless ? "lossless" : "muted",
        })}
      >
        {view.chain.fileLabel}
      </span>
      <span className={stageChip({ tone: view.chain.transcoding ? "warning" : "success" })}>
        {t("stage.serverChip", { value: view.chain.serverLabel })}
      </span>
      <span className={stageChip({ tone: view.chain.equalizerActive ? "success" : "muted" })}>
        {t("stage.equalizerChip", { value: view.chain.equalizerLabel })}
      </span>
    </div>
  );
}
