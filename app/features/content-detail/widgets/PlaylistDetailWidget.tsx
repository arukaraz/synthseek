"use client";

import { usePlaylistDetail } from "@hooks/api/queries/content-detail";
import { memo } from "react";
import { useTranslation } from "react-i18next";

import { DetailEmpty, DetailSection } from "../components/DetailSection";
import { Tracklist } from "../components/Tracklist";
import type { PlaylistDetailWidgetProps } from "../types";

function PlaylistDetailWidgetComponent({ playlistId }: PlaylistDetailWidgetProps) {
  const { t } = useTranslation("contentDetail");
  const { data, isLoading } = usePlaylistDetail({ playlistId });

  const tracks = data?.tracks ?? [];
  const inLibraryCount = tracks.filter((track) => track.inLibrary).length;

  const count =
    data && tracks.length > 0 ? t("tracklistCount", { inLibrary: inLibraryCount, total: tracks.length }) : undefined;

  return (
    <DetailSection title={t("sections.tracklist")} isLoading={isLoading} skeletonHeight="h-72" count={count}>
      {tracks.length > 0 ? <Tracklist tracks={tracks} showArtist /> : <DetailEmpty message={t("empty.tracklist")} />}
    </DetailSection>
  );
}

export const PlaylistDetailWidget = memo(PlaylistDetailWidgetComponent);
