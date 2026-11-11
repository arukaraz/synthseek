"use client";

import { formatTrackDuration } from "@utils/formatters";
import { useTranslation } from "react-i18next";

import { previewTime } from "./styles";
import type { PreviewTimeProps } from "./types";

export function PreviewTime({ clock }: PreviewTimeProps) {
  const { t } = useTranslation("components");

  return (
    <span className={previewTime()}>
      {t("preview.time", {
        elapsed: formatTrackDuration(clock.elapsedSeconds * 1000),
        total: formatTrackDuration(clock.totalSeconds * 1000),
      })}
    </span>
  );
}
