"use client";

import { useArtistDiscography, useArtistIdentity } from "@hooks/api/queries/content-detail";
import { memo } from "react";
import { useTranslation } from "react-i18next";

import { DetailSection } from "../components/DetailSection";
import { DetailsFacts } from "../components/DetailsFacts";
import { countAlbumsInLibrary, formatBorn, visibleFacts } from "../helpers";
import type { ArtistIdentityWidgetProps, FactItem } from "../types";

function ArtistIdentityWidgetComponent({ deezerArtistId, artistName }: ArtistIdentityWidgetProps) {
  const { t } = useTranslation("contentDetail");
  const { data, isLoading } = useArtistIdentity({ deezerArtistId, artistName });
  const { data: discography } = useArtistDiscography({ deezerArtistId });
  const albumsInLibrary = countAlbumsInLibrary(discography);

  const facts: FactItem[] = [
    { label: t("details.type"), value: data?.type ?? null },
    { label: t("details.country"), value: data?.country ?? null },
    { label: t("details.formed"), value: data?.formedYear ? String(data.formedYear) : null },
    { label: t("details.realName"), value: data?.realName ?? null },
    { label: t("details.born"), value: formatBorn(data?.bornDate ?? null, data?.bornPlace ?? null) },
    { label: t("details.albumsInLibrary"), value: albumsInLibrary !== null ? String(albumsInLibrary) : null },
    { label: t("details.members"), value: null, items: data?.members ?? [] },
    {
      label: t("details.awards"),
      value: null,
      items: data?.awards.filter((award) => award.won).map((award) => award.name) ?? [],
    },
  ];

  return (
    <DetailSection title={t("sections.details")} isLoading={isLoading} isEmpty={visibleFacts(facts).length === 0}>
      <DetailsFacts facts={facts} />
    </DetailSection>
  );
}

export const ArtistIdentityWidget = memo(ArtistIdentityWidgetComponent);
