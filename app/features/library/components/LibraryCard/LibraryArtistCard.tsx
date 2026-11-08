"use client";

import { useArtistImage } from "@hooks/api/queries/content-detail";
import { useTranslation } from "react-i18next";

import { ArtistCard } from "./ArtistCard";
import { CardArtwork } from "./CardArtwork";
import { CardPlayButton } from "./CardPlayButton";
import { artistSubtitle } from "./helpers";
import { LibraryListRow } from "./LibraryListRow";
import type { LibraryArtistCardProps } from "./types";

export function LibraryArtistCard({
  item,
  resolveEnabled,
  onOpen,
  onPlay,
  chrome,
  variant = "card",
}: LibraryArtistCardProps) {
  const { t } = useTranslation(["library", "contentDetail"]);
  const { image, isLoading } = useArtistImage(item.artist, resolveEnabled);

  if (variant === "row") {
    return (
      <LibraryListRow
        title={item.artist}
        subtitle={artistSubtitle(item, t("library:page.counts.albums", { count: item.albumCount }))}
        openLabel={t("contentDetail:openDetail", { name: item.artist })}
        artwork={<CardArtwork src={isLoading ? null : (image ?? item.albumArt)} name={item.artist} sizes="56px" />}
        round
        onOpen={onOpen}
        trailing={
          onPlay ? <CardPlayButton name={item.artist} order="shuffled" onPlay={onPlay} placement="inline" /> : null
        }
      />
    );
  }

  return (
    <ArtistCard item={item} image={image} isResolving={isLoading} onOpen={onOpen} onPlay={onPlay} chrome={chrome} />
  );
}
