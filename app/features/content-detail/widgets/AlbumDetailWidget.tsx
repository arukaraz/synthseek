"use client";

import { useAlbumDetail } from "@hooks/api/queries/content-detail";
import { useTranslation } from "react-i18next";

import { DetailEmpty, DetailSection } from "../components/DetailSection";
import { Tracklist } from "../components/Tracklist";
import type { AlbumDetailWidgetProps } from "../types";

export function AlbumDetailWidget({ deezerAlbumId }: AlbumDetailWidgetProps) {
  const { t } = useTranslation("contentDetail");
  const { data, isLoading } = useAlbumDetail({ deezerAlbumId });

  const tracks = data?.tracks ?? [];
  const inLibraryCount = tracks.filter((track) => track.inLibrary).length;

  const count =
    data && tracks.length > 0 ? t("tracklistCount", { inLibrary: inLibraryCount, total: tracks.length }) : undefined;

  return (
    <DetailSection title={t("sections.tracklist")} isLoading={isLoading} skeletonHeight="h-72" count={count}>
      {tracks.length > 0 ? <Tracklist tracks={tracks} /> : <DetailEmpty message={t("empty.tracklist")} />}
    </DetailSection>
  );
}
