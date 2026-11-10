"use client";

import { RequestSplitButton } from "@components/RequestSplitButton";
import { useArtistTopTracks } from "@hooks/api/queries/content-detail";
import { memo, useMemo } from "react";
import { useTranslation } from "react-i18next";

import { DetailEmpty, DetailSection } from "../components/DetailSection";
import { Tracklist } from "../components/Tracklist";
import { useContentDetailActions } from "../ContentDetailActionsContext";
import { EMPTY_TRACKS } from "../constants";
import { unrequestedTracks } from "../helpers";
import type { ArtistTopTracksWidgetProps } from "../types";

function ArtistTopTracksWidgetComponent({ artist }: ArtistTopTracksWidgetProps) {
  const { t } = useTranslation("contentDetail");
  const { requestTopTracks } = useContentDetailActions();
  const { data, isLoading } = useArtistTopTracks({ catalogArtistId: artist.id });

  const tracks = data ?? EMPTY_TRACKS;
  const missing = useMemo(() => unrequestedTracks(tracks), [tracks]);

  const trailingSlot =
    missing.length > 0 ? (
      <RequestSplitButton
        name={artist.name}
        label={t("requestTopTracks")}
        size="sm"
        tone="ghost"
        onRequest={() => requestTopTracks({ artist, tracks: missing }, "direct")}
        onCustomize={() => requestTopTracks({ artist, tracks: missing }, "customize")}
        dataCy="top-tracks-request"
      />
    ) : undefined;

  return (
    <DetailSection
      title={t("sections.topTracks")}
      isLoading={isLoading}
      skeletonHeight="h-64"
      trailingSlot={trailingSlot}
    >
      {tracks.length > 0 ? <Tracklist tracks={tracks} showArtist /> : <DetailEmpty message={t("empty.topTracks")} />}
    </DetailSection>
  );
}

export const ArtistTopTracksWidget = memo(ArtistTopTracksWidgetComponent);
