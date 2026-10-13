"use client";

import { useTranslation } from "react-i18next";

import { useAlbumRelease } from "@hooks/api/queries/useActiveReleases";
import { useDownloadSourceLabel } from "@hooks/ui/useDownloadSourceLabel";

import { sidebarReleaseLine } from "./styles";
import type { RequestSidebarReleaseProps } from "./types";

export function RequestSidebarRelease({ albumId }: RequestSidebarReleaseProps) {
  const { t } = useTranslation("requests");
  const sourceLabel = useDownloadSourceLabel();
  const release = useAlbumRelease(albumId);
  if (release === null) return null;
  const source = sourceLabel(release.source);

  return (
    <p className={sidebarReleaseLine({ state: release.state })} data-testid="sidebar-release-line">
      {release.state === "queued"
        ? t("release.sidebarQueued", { source })
        : t("release.sidebarFetching", { source, percent: release.percent })}
    </p>
  );
}
