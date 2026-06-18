"use client";

import { Badge } from "@components/ui/Badge";
import { cn } from "@utils/cn";
import { artworkProxySrc } from "@utils/artworkProxy";
import { scale } from "@utils/animations";
import { categoryPlaceholder, cardBottomContent, albumThumbnail, hoverBorder, playIcon } from "../styles";
import { motion } from "framer-motion";
import { Play, User, Music } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { ArtistSpotlightCardProps } from "./types";

export function ArtistSpotlightCard({ artist, latestAlbum, onClick }: ArtistSpotlightCardProps) {
  const { t } = useTranslation("discover");
  const [imageError, setImageError] = useState(false);
  const [albumImageError, setAlbumImageError] = useState(false);

  const artistImage = artist.images[0]?.url;
  const albumImage = latestAlbum?.images[0]?.url;
  const trackCount = latestAlbum?.total_tracks ?? 0;

  return (
    <motion.div
      onClick={onClick}
      className={cn(
        "group relative cursor-pointer overflow-hidden rounded-lg",
        "transition-all duration-300 hover:shadow-xl"
      )}
      variants={scale}
      initial="initial"
      whileHover="hover"
      whileTap="tap"
    >
      <div className="relative aspect-3/4">
        {artistImage && !imageError ? (
          <Image
            src={artworkProxySrc(artistImage)}
            alt={artist.name}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            onError={() => setImageError(true)}
            unoptimized
          />
        ) : (
          <div className={categoryPlaceholder()}>
            <User className="text-fg/20 h-20 w-20" />
          </div>
        )}

        <div className="absolute inset-0 bg-linear-to-t from-black via-black/70 to-transparent" />

        <div className="absolute top-2 left-2 z-10 sm:top-3 sm:left-3">
          <Badge className="type-badge type-badge-artist shadow-lg">{t("artistSpotlight.artistBadge")}</Badge>
        </div>

        <div className={cardBottomContent()}>
          <h3 className="text-overlay-fg mb-2 line-clamp-1 text-base font-bold sm:text-lg">{artist.name}</h3>

          {latestAlbum && (
            <div className="flex items-center gap-2">
              <div className={albumThumbnail()}>
                {albumImage && !albumImageError ? (
                  <Image
                    src={artworkProxySrc(albumImage)}
                    alt={latestAlbum.name}
                    fill
                    className="object-cover"
                    sizes="48px"
                    onError={() => setAlbumImageError(true)}
                    unoptimized
                  />
                ) : (
                  <div className="bg-fg/10 flex h-full w-full items-center justify-center">
                    <Music className="text-fg/40 h-4 w-4" />
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-overlay-fg-muted text-[10px] tracking-wide uppercase sm:text-xs">
                  {t("artistSpotlight.latestRelease")}
                </p>
                <div className="flex items-center gap-1.5">
                  <Play className={playIcon()} />
                  <p className="text-overlay-fg line-clamp-1 text-xs font-medium sm:text-sm">{latestAlbum.name}</p>
                </div>
                {trackCount > 0 && (
                  <p className="text-overlay-fg-muted text-[10px] sm:text-xs">
                    {t("artistSpotlight.songs", { count: trackCount })}
                  </p>
                )}
              </div>
            </div>
          )}

          {!latestAlbum && <p className="text-overlay-fg-muted text-xs">{t("artistSpotlight.noAlbums")}</p>}
        </div>

        <div className={hoverBorder()} />
      </div>
    </motion.div>
  );
}
