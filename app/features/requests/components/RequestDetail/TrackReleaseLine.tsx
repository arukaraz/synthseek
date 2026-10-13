"use client";

import { useTranslation } from "react-i18next";

import { useDownloadSourceLabel } from "@hooks/ui/useDownloadSourceLabel";

import { releaseTrackLine } from "./styles";
import type { ReleaseProgressCardProps } from "./types";

export function TrackReleaseLine({ release }: ReleaseProgressCardProps) {
  const { t } = useTranslation("requests");
  const sourceLabel = useDownloadSourceLabel();
  const source = sourceLabel(release.source);

  return (
    <span className={releaseTrackLine()} data-testid="track-release-line">
      {release.state === "queued"
        ? t("release.trackQueued", { source })
        : t("release.trackFetching", { source, percent: release.percent })}
    </span>
  );
}
