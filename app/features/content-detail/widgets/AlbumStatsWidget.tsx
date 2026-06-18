"use client";

import { useAlbumStats } from "@hooks/api/queries/content-detail";
import { memo } from "react";
import { useTranslation } from "react-i18next";

import { AboutBio } from "../components/AboutBio";
import { DetailSection } from "../components/DetailSection";
import { StatRow } from "../components/StatRow";
import type { AlbumStatsWidgetProps, StatItem } from "../types";

function AlbumStatsWidgetComponent({ artistName, albumName, trackCount, slot }: AlbumStatsWidgetProps) {
  const { t } = useTranslation("contentDetail");
  const { data, isLoading } = useAlbumStats({ artistName, albumName, mbid: null });

  if (slot === "about") {
    return (
      <DetailSection title={t("sections.about")} isLoading={isLoading} isEmpty={!data?.description}>
        <AboutBio text={data?.description ?? null} />
      </DetailSection>
    );
  }

  const stats: StatItem[] = [
    { label: t("stats.listeners"), value: data?.listeners ?? null },
    { label: t("stats.scrobbles"), value: data?.scrobbles ?? null },
    { label: t("stats.lbListens"), value: data?.lbListens ?? null },
    { label: t("stats.tracks"), value: trackCount },
  ];

  if (isLoading) {
    return <div className="bg-fg/5 h-24 w-full animate-pulse rounded-xl" />;
  }

  return <StatRow stats={stats} />;
}

export const AlbumStatsWidget = memo(AlbumStatsWidgetComponent);
