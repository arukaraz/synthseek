"use client";

import { useArtistDiscography, useArtistIdentity, useArtistStats } from "@hooks/api/queries/content-detail";
import { memo } from "react";
import { useTranslation } from "react-i18next";

import { SOURCE_NAMES } from "@components/SourceBadge";

import { AboutBio } from "../components/AboutBio";
import { DetailSection } from "../components/DetailSection";
import { figureGroupsOf, SourceFigures } from "../components/SourceFigures";
import { countAlbumsInLibrary } from "../helpers";
import { statSkeleton } from "../styles";
import type { ArtistStatsWidgetProps } from "../types";

function ArtistStatsWidgetComponent({ catalogArtistId, artistName, mbid, slot }: ArtistStatsWidgetProps) {
  const { t } = useTranslation("contentDetail");
  const { data, isLoading } = useArtistStats({ artistName, mbid, catalogArtistId });
  const { data: identity } = useArtistIdentity({ catalogArtistId, artistName, enabled: slot === "stats" });
  const { data: discography } = useArtistDiscography({ catalogArtistId, artistName, enabled: slot === "stats" });

  if (slot === "about") {
    const bio = data?.bio ?? null;
    return (
      <DetailSection title={t("sections.about")} isLoading={isLoading} isEmpty={!bio}>
        <AboutBio
          text={bio?.text ?? null}
          source={bio ? { source: "wikipedia", label: SOURCE_NAMES.wikipedia, href: bio.url } : undefined}
        />
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
        catalogFans: identity?.catalogFans,
      })}
      plain={{ label: t("stats.inLibrary"), value: countAlbumsInLibrary(discography) }}
    />
  );
}

export const ArtistStatsWidget = memo(ArtistStatsWidgetComponent);
