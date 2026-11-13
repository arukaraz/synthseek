"use client";

import { useAlbumDetail } from "@hooks/api/queries/content-detail";
import { memo } from "react";
import { useTranslation } from "react-i18next";

import { deriveTrackStatusCounts, failedToLoad } from "../helpers";
import { DetailEmpty, DetailSection } from "../components/DetailSection";
import { Tracklist } from "../components/Tracklist";
import type { AlbumDetailWidgetProps } from "../types";

function AlbumDetailWidgetComponent({ catalogAlbumId }: AlbumDetailWidgetProps) {
  const { t } = useTranslation("contentDetail");
  const query = useAlbumDetail({ catalogAlbumId });
  const { data, isLoading } = query;

  const tracks = data?.tracks ?? [];
  const { completeCount } = deriveTrackStatusCounts(tracks);

  const count =
    data && tracks.length > 0 ? t("tracklistCount", { inLibrary: completeCount, total: tracks.length }) : undefined;

  return (
    <DetailSection
      title={t("sections.tracklist")}
      isLoading={isLoading}
      errorMessage={failedToLoad(query) ? t("loadFailed") : null}
      skeletonHeight="h-72"
      count={count}
    >
      {tracks.length > 0 ? <Tracklist tracks={tracks} /> : <DetailEmpty message={t("empty.tracklist")} />}
    </DetailSection>
  );
}

export const AlbumDetailWidget = memo(AlbumDetailWidgetComponent);
