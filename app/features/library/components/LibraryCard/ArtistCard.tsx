"use client";

import Image from "next/image";
import { useTranslation } from "react-i18next";

import { artworkProxySrc } from "@utils/artworkProxy";

import { cardInitials, handleCardActivationKey } from "./helpers";
import {
  cardBody,
  cardCover,
  cardImage,
  cardInitials as cardInitialsStyle,
  cardMeta,
  cardRoot,
  cardSubtitle,
  cardTitle,
} from "./styles";
import type { ArtistCardProps } from "./types";

export function ArtistCard({ item, image, isResolving = false, onOpen }: ArtistCardProps) {
  const { t } = useTranslation(["library", "contentDetail"]);
  const albumsLabel = t("library:page.counts.albums", { count: item.albumCount });
  const subtitle = item.genre ? `${albumsLabel} · ${item.genre}` : albumsLabel;
  const cover = isResolving ? null : (image ?? item.albumArt);

  return (
    <li
      className={cardRoot({ interactive: !!onOpen })}
      role={onOpen ? "button" : undefined}
      tabIndex={onOpen ? 0 : undefined}
      aria-label={onOpen ? t("contentDetail:openDetail", { name: item.artist }) : undefined}
      onClick={onOpen}
      onKeyDown={onOpen ? (event) => handleCardActivationKey(event, onOpen) : undefined}
    >
      <div className={cardCover()}>
        {cover ? (
          <Image
            src={artworkProxySrc(cover)}
            alt=""
            fill
            sizes="(max-width: 640px) 50vw, 20vw"
            className={cardImage()}
          />
        ) : (
          <span aria-hidden className={cardInitialsStyle()}>
            {cardInitials(item.artist)}
          </span>
        )}
      </div>

      <div className={cardBody()}>
        <p className={cardTitle()}>{item.artist}</p>
        <p className={cardSubtitle()}>{subtitle}</p>
        <p className={cardMeta()}>{t("library:page.counts.tracks", { count: item.trackCount })}</p>
      </div>
    </li>
  );
}
