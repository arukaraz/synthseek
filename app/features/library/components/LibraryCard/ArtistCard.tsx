"use client";

import Image from "next/image";
import { useTranslation } from "react-i18next";

import { cardInitials } from "./helpers";
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

export function ArtistCard({ item }: ArtistCardProps) {
  const { t } = useTranslation("library");
  const albumsLabel = t("page.counts.albums", { count: item.albumCount });
  const subtitle = item.genre ? `${albumsLabel} · ${item.genre}` : albumsLabel;

  return (
    <li className={cardRoot()}>
      <div className={cardCover()}>
        {item.albumArt ? (
          <Image src={item.albumArt} alt="" fill sizes="(max-width: 640px) 50vw, 20vw" className={cardImage()} />
        ) : (
          <span aria-hidden className={cardInitialsStyle()}>
            {cardInitials(item.artist)}
          </span>
        )}
      </div>

      <div className={cardBody()}>
        <p className={cardTitle()}>{item.artist}</p>
        <p className={cardSubtitle()}>{subtitle}</p>
        <p className={cardMeta()}>{t("page.counts.tracks", { count: item.trackCount })}</p>
      </div>
    </li>
  );
}
