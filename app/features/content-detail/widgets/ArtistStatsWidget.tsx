"use client";

import { useArtistStats } from "@hooks/api/queries/content-detail";
import { useTranslation } from "react-i18next";

import { AboutBio } from "../components/AboutBio";
import { DetailSection } from "../components/DetailSection";
import { StatRow } from "../components/StatRow";
import type { ArtistStatsWidgetProps, StatItem } from "../types";

export function ArtistStatsWidget({ artistName, mbid, inLibraryCount, slot }: ArtistStatsWidgetProps) {
  const { t } = useTranslation("contentDetail");
  const { data, isLoading } = useArtistStats({ artistName, mbid });

  if (slot === "about") {
    return (
      <DetailSection title={t("sections.about")} isLoading={isLoading} isEmpty={!data?.bio}>
        <AboutBio text={data?.bio ?? null} />
      </DetailSection>
    );
  }

  const stats: StatItem[] = [
    { label: t("stats.listeners"), value: data?.listeners ?? null },
    { label: t("stats.scrobbles"), value: data?.scrobbles ?? null },
    { label: t("stats.lbListens"), value: data?.lbListens ?? null },
    { label: t("stats.inLibrary"), value: inLibraryCount },
  ];

  if (isLoading) {
    return <div className="bg-fg/5 h-9 w-full max-w-xs animate-pulse rounded-lg" />;
  }

  return <StatRow stats={stats} />;
}
