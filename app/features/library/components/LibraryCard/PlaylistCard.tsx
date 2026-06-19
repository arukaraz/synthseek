"use client";

import { cn } from "@utils/cn";
import { artworkProxySrc } from "@utils/artworkProxy";
import Image from "next/image";
import { useTranslation } from "react-i18next";

import { cardInitials, handleCardActivationKey, mosaicTiles, statusDotClass } from "./helpers";
import { PlaylistCardMenu } from "./PlaylistCardMenu";
import {
  cardBody,
  cardCover,
  cardImage,
  cardInitials as cardInitialsStyle,
  cardMeta,
  cardMosaic,
  cardMosaicTile,
  cardRoot,
  cardStatusBadge,
  cardStatusDot,
  cardSubtitle,
  cardTitle,
} from "./styles";
import type { PlaylistCardProps } from "./types";

export function PlaylistCard({ item, onOpen }: PlaylistCardProps) {
  const { t } = useTranslation("library");
  const { t: tDetail } = useTranslation("contentDetail");
  const tiles = mosaicTiles(item.images, item.image);
  const origin = item.source_provider ? t("page.origin.imported") : t("page.origin.createdHere");
  const openLabel = onOpen ? tDetail("openDetail", { name: item.name }) : undefined;

  return (
    <li
      className={cardRoot({ interactive: !!onOpen })}
      role={onOpen ? "button" : undefined}
      tabIndex={onOpen ? 0 : undefined}
      aria-label={openLabel}
      onClick={onOpen}
      onKeyDown={onOpen ? (event) => handleCardActivationKey(event, onOpen) : undefined}
    >
      <div className={cardCover()}>
        {tiles.length === 0 ? (
          <span aria-hidden className={cardInitialsStyle()}>
            {cardInitials(item.name)}
          </span>
        ) : tiles.length === 1 ? (
          <Image
            src={artworkProxySrc(tiles[0])}
            alt=""
            fill
            sizes="(max-width: 640px) 50vw, 20vw"
            className={cardImage()}
          />
        ) : (
          <div className={cardMosaic()}>
            {tiles.map((src, index) => (
              <div key={`${src}-${index}`} className={cardMosaicTile()}>
                <Image
                  src={artworkProxySrc(src)}
                  alt=""
                  fill
                  sizes="(max-width: 640px) 25vw, 10vw"
                  className={cardImage()}
                />
              </div>
            ))}
          </div>
        )}
        <span className={cardStatusBadge()}>
          <span className={cn(cardStatusDot(), statusDotClass(item.status))} />
          {item.completed_tracks}/{item.total_tracks}
        </span>
        <PlaylistCardMenu item={item} />
      </div>

      <div className={cardBody()}>
        <p className={cardTitle()}>{item.name}</p>
        <p className={cardSubtitle()}>{origin}</p>
        <p className={cardMeta()}>{t("page.counts.tracks", { count: item.total_tracks })}</p>
      </div>
    </li>
  );
}
