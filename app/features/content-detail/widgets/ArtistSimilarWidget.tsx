"use client";

import { useArtistSimilar } from "@hooks/api/queries/content-detail";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef } from "react";
import { useTranslation } from "react-i18next";

import { DetailEmpty, DetailSection } from "../components/DetailSection";
import { RAIL_SCROLL_STEP } from "../components/MoreFromArtist/constants";
import { SimilarArtists } from "../components/SimilarArtists";
import type { SimilarArtistEntry } from "../components/SimilarArtists/types";
import { artistTarget } from "../helpers";
import { railNav } from "../styles";
import type { ArtistSimilarWidgetProps } from "../types";

export function ArtistSimilarWidget({ artistName, onSelectArtist }: ArtistSimilarWidgetProps) {
  const { t } = useTranslation("contentDetail");
  const trackRef = useRef<HTMLDivElement | null>(null);
  const { data, isLoading } = useArtistSimilar({ artistName });

  const artists = data ?? [];

  const scrollBy = (direction: 1 | -1) => {
    trackRef.current?.scrollBy({ left: direction * RAIL_SCROLL_STEP, behavior: "smooth" });
  };

  const handleSelect = (artist: SimilarArtistEntry) => {
    if (!artist.deezerArtistId) return;
    onSelectArtist(artistTarget({ id: artist.deezerArtistId, name: artist.name, cover: artist.image }));
  };

  const trailingSlot =
    artists.length > 0 ? (
      <>
        <button type="button" aria-label={t("rail.prev")} className={railNav()} onClick={() => scrollBy(-1)}>
          <ChevronLeft className="size-4" aria-hidden />
        </button>
        <button type="button" aria-label={t("rail.next")} className={railNav()} onClick={() => scrollBy(1)}>
          <ChevronRight className="size-4" aria-hidden />
        </button>
      </>
    ) : undefined;

  return (
    <DetailSection
      title={t("sections.similar")}
      isLoading={isLoading}
      skeletonHeight="h-32"
      count={artists.length > 0 ? artists.length : undefined}
      trailingSlot={trailingSlot}
    >
      {artists.length > 0 ? (
        <SimilarArtists artists={artists} onSelect={handleSelect} trackRef={trackRef} />
      ) : (
        <DetailEmpty message={t("empty.similar")} />
      )}
    </DetailSection>
  );
}
