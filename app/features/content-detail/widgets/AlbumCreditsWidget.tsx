"use client";

import { useAlbumCredits } from "@hooks/api/queries/content-detail";
import { formatYear } from "@utils/formatters";
import { useTranslation } from "react-i18next";

import { DetailSection } from "../components/DetailSection";
import { DetailsFacts } from "../components/DetailsFacts";
import { visibleFacts } from "../helpers";
import type { AlbumCreditsWidgetProps, FactItem } from "../types";

export function AlbumCreditsWidget({ deezerAlbumId, releaseDate, label, recordType, length }: AlbumCreditsWidgetProps) {
  const { t } = useTranslation("contentDetail");
  const { data, isLoading } = useAlbumCredits({ deezerAlbumId, barcode: null });

  const facts: FactItem[] = [
    { label: t("details.released"), value: releaseDate ? formatYear(releaseDate) : null },
    { label: t("details.label"), value: label },
    { label: t("details.type"), value: recordType },
    { label: t("details.producer"), value: data?.producers.length ? data.producers.join(", ") : null },
    { label: t("details.studio"), value: data?.studios.length ? data.studios.join(", ") : null },
    { label: t("details.certification"), value: data?.certification ?? null },
    { label: t("details.length"), value: length },
  ];

  return (
    <DetailSection title={t("sections.details")} isLoading={isLoading} isEmpty={visibleFacts(facts).length === 0}>
      <DetailsFacts facts={facts} />
    </DetailSection>
  );
}
