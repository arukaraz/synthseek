"use client";

import { useAlbumDetail, useAlbumStats } from "@hooks/api/queries/content-detail";
import { memo } from "react";
import { useTranslation } from "react-i18next";

import { AboutBio } from "../components/AboutBio";
import { DetailSection } from "../components/DetailSection";
import { figureGroupsOf, SourceFigures } from "../components/SourceFigures";
import { statSkeleton } from "../styles";
import type { AlbumStatsWidgetProps } from "../types";

function AlbumStatsWidgetComponent({ catalogAlbumId, artistName, albumName, trackCount, slot }: AlbumStatsWidgetProps) {
  const { t } = useTranslation("contentDetail");
  const { data, isLoading } = useAlbumStats({ artistName, albumName, catalogAlbumId });
  const { data: album } = useAlbumDetail({ catalogAlbumId, enabled: slot === "stats" });

  if (slot === "about") {
    return (
      <DetailSection title={t("sections.about")} isLoading={isLoading} isEmpty={!data?.description}>
        <AboutBio text={data?.description ?? null} />
      </DetailSection>
    );
  }

  if (isLoading) {
    return <div className={statSkeleton()} />;
  }

  return (
    <SourceFigures
      groups={figureGroupsOf({
        lastfm: data?.lastfm,
        listenbrainz: data?.listenbrainz,
        catalogFans: album?.catalogFans,
      })}
      plain={{ label: t("stats.tracks"), value: trackCount }}
    />
  );
}

export const AlbumStatsWidget = memo(AlbumStatsWidgetComponent);
