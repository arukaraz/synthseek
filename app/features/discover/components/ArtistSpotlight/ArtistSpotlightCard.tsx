"use client";

import { Badge } from "@components/ui/Badge";
import { artworkImage } from "@utils/artworkProxy";
import { scale } from "@utils/animations";
import { categoryPlaceholder, cardBottomContent, albumThumbnail, hoverBorder, playIcon } from "../styles";
import { spotlightCard, spotlightCardMedia, spotlightDismiss, spotlightLoading, spotlightPlay } from "./styles";
import { motion } from "framer-motion";
import { Loader2, Play, User, Music, X } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { ArtistSpotlightCardProps } from "./types";

export function ArtistSpotlightCard({
  artist,
  latestAlbum,
  onClick,
  onPlay,
  onDismiss,
  dismissDisabled = false,
  loading = false,
}: ArtistSpotlightCardProps) {
  const { t } = useTranslation("discover");
  const [imageError, setImageError] = useState(false);
  const [albumImageError, setAlbumImageError] = useState(false);

  const artistImage = artist.images[0]?.url;
  const albumImage = latestAlbum?.images[0]?.url;
  const trackCount = latestAlbum?.total_tracks ?? 0;

  return (
    <motion.div
      onClick={onClick}
      className={spotlightCard()}
      aria-busy={loading}
      variants={scale}
      initial="initial"
      whileHover="hover"
      whileTap="tap"
    >
      <div className={spotlightCardMedia()}>
        {artistImage && !imageError ? (
          <Image
            {...artworkImage(artistImage)}
            alt={artist.name}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className={categoryPlaceholder()}>
            <User className="text-fg/20 h-20 w-20" />
          </div>
        )}

        <div className="from-veil via-veil/70 absolute inset-0 bg-linear-to-t to-transparent" />

        <div className="absolute top-2 left-2 z-10 sm:top-3 sm:left-3">
          <Badge className="type-badge type-badge-overlay type-badge-artist shadow-lg">
            {t("artistSpotlight.artistBadge")}
          </Badge>
        </div>

        <div className={cardBottomContent()}>
          <h3 className="text-overlay-fg mb-2 line-clamp-1 text-base font-bold sm:text-lg">{artist.name}</h3>

          {latestAlbum && (
            <div className="flex items-center gap-2">
              <div className={albumThumbnail()}>
                {albumImage && !albumImageError ? (
                  <Image
                    {...artworkImage(albumImage)}
                    alt={latestAlbum.name}
                    fill
                    className="object-cover"
                    sizes="48px"
                    onError={() => setAlbumImageError(true)}
                  />
                ) : (
                  <div className="bg-fg/10 flex h-full w-full items-center justify-center">
                    <Music className="text-fg/40 h-4 w-4" />
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-overlay-fg-muted text-10 tracking-wide uppercase sm:text-xs">
                  {t("artistSpotlight.latestRelease")}
                </p>
                <div className="flex items-center gap-1.5">
                  <Play className={playIcon()} />
                  <p className="text-overlay-fg line-clamp-1 text-xs font-medium sm:text-sm">{latestAlbum.name}</p>
                </div>
                {trackCount > 0 && (
                  <p className="text-overlay-fg-muted text-10 sm:text-xs">
                    {t("artistSpotlight.songs", { count: trackCount })}
                  </p>
                )}
              </div>
            </div>
          )}

          {!latestAlbum && <p className="text-overlay-fg-muted text-xs">{t("artistSpotlight.noAlbums")}</p>}
        </div>

        <div className={hoverBorder()} />

        {loading ? (
          <div role="status" aria-label={t("artistSpotlight.finding")} className={spotlightLoading()}>
            <Loader2 aria-hidden="true" />
          </div>
        ) : null}

        {onDismiss ? (
          <button
            type="button"
            className={spotlightDismiss()}
            aria-label={t("artistSpotlight.dismiss", { name: artist.name })}
            title={t("artistSpotlight.dismiss", { name: artist.name })}
            disabled={dismissDisabled}
            onClick={(event) => {
              event.stopPropagation();
              onDismiss();
            }}
          >
            <X />
          </button>
        ) : null}

        {onPlay ? (
          <button
            type="button"
            className={spotlightPlay()}
            aria-label={t("history.play", { name: artist.name })}
            onClick={(event) => {
              event.stopPropagation();
              onPlay();
            }}
          >
            <Play />
          </button>
        ) : null}
      </div>
    </motion.div>
  );
}
