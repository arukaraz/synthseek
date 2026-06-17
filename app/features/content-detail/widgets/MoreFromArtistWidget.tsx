"use client";

import { useArtistDiscography } from "@hooks/api/queries/content-detail";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef } from "react";
import { useTranslation } from "react-i18next";

import { DetailEmpty, DetailSection } from "../components/DetailSection";
import { MoreFromArtist } from "../components/MoreFromArtist";
import { RAIL_SCROLL_STEP } from "../components/MoreFromArtist/constants";
import { albumTarget } from "../helpers";
import { railNav } from "../styles";
import type { ContentCardItem, MoreFromArtistWidgetProps } from "../types";

export function MoreFromArtistWidget({
  artistExternalId,
  artistName,
  excludeAlbumId,
  onSelectAlbum,
}: MoreFromArtistWidgetProps) {
  const { t } = useTranslation("contentDetail");
  const trackRef = useRef<HTMLDivElement | null>(null);
  const { data, isLoading } = useArtistDiscography({
    deezerArtistId: artistExternalId ?? "",
    enabled: !!artistExternalId,
  });

  if (!artistExternalId) return null;

  const albums: ContentCardItem[] = (data?.groups ?? [])
    .flatMap((group) => group.albums)
    .filter((album) => album.externalId !== excludeAlbumId)
    .map((album) => ({
      id: album.externalId,
      title: album.title,
      subtitle: null,
      image: album.image,
      inLibrary: album.inLibrary,
      libraryTrackCount: album.libraryTrackCount,
      totalTracks: album.totalTracks,
    }));

  const scrollBy = (direction: 1 | -1) => {
    trackRef.current?.scrollBy({ left: direction * RAIL_SCROLL_STEP, behavior: "smooth" });
  };

  const handleSelect = (item: ContentCardItem) => {
    onSelectAlbum(albumTarget({ id: item.id, name: item.title, artistName, cover: item.image }));
  };

  const trailingSlot =
    albums.length > 0 ? (
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
      title={t("sections.moreFrom", { name: artistName })}
      isLoading={isLoading}
      isEmpty={albums.length === 0}
      skeletonHeight="h-44"
      count={albums.length > 0 ? albums.length : undefined}
      trailingSlot={trailingSlot}
    >
      {albums.length > 0 ? (
        <MoreFromArtist albums={albums} onSelectAlbum={handleSelect} trackRef={trackRef} />
      ) : (
        <DetailEmpty message={t("empty.moreFrom")} />
      )}
    </DetailSection>
  );
}
