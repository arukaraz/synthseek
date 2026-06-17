"use client";

import { useArtistTopTracks } from "@hooks/api/queries/content-detail";
import { useTranslation } from "react-i18next";

import { DetailEmpty, DetailSection } from "../components/DetailSection";
import { Tracklist } from "../components/Tracklist";
import type { ArtistTopTracksWidgetProps } from "../types";

export function ArtistTopTracksWidget({ deezerArtistId }: ArtistTopTracksWidgetProps) {
  const { t } = useTranslation("contentDetail");
  const { data, isLoading } = useArtistTopTracks({ deezerArtistId });

  const tracks = data ?? [];

  return (
    <DetailSection title={t("sections.topTracks")} isLoading={isLoading} skeletonHeight="h-64">
      {tracks.length > 0 ? <Tracklist tracks={tracks} showArtist /> : <DetailEmpty message={t("empty.topTracks")} />}
    </DetailSection>
  );
}
