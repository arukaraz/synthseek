"use client";

import { useArtistImage } from "@hooks/api/queries/content-detail";

import { ArtistCard } from "./ArtistCard";
import type { LibraryArtistCardProps } from "./types";

export function LibraryArtistCard({ item, resolveEnabled, onOpen }: LibraryArtistCardProps) {
  const { image, isLoading } = useArtistImage(item.artist, resolveEnabled);

  return <ArtistCard item={item} image={image} isResolving={isLoading} onOpen={onOpen} />;
}
