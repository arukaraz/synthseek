"use client";

import Image from "next/image";
import { useTranslation } from "react-i18next";

import { artworkProxySrc } from "@utils/artworkProxy";

import { CardCoverActions } from "./CardCoverActions";
import { cardCoverActionsFrom, cardInitials, handleCardActivationKey } from "./helpers";
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

export function ArtistCard({ item, image, isResolving = false, onOpen, onPlay }: ArtistCardProps) {
  const { t } = useTranslation(["library", "contentDetail"]);
  const albumsLabel = t("library:page.counts.albums", { count: item.albumCount });
  const subtitle = item.genre ? `${albumsLabel} · ${item.genre}` : albumsLabel;
  const cover = isResolving ? null : (image ?? item.albumArt);
  const coverActions = cardCoverActionsFrom(onOpen, onPlay);
  const activates = !!onOpen && coverActions === null;

  return (
    <li
      className={cardRoot({ interactive: activates })}
      role={activates ? "button" : undefined}
      tabIndex={activates ? 0 : undefined}
      aria-label={activates ? t("contentDetail:openDetail", { name: item.artist }) : undefined}
      onClick={activates ? onOpen : undefined}
      onKeyDown={activates && onOpen ? (event) => handleCardActivationKey(event, onOpen) : undefined}
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
        {coverActions ? (
          <CardCoverActions name={item.artist} onPlay={coverActions.play} onOpen={coverActions.open} />
        ) : null}
      </div>

      <div className={cardBody()}>
        <p className={cardTitle()}>{item.artist}</p>
        <p className={cardSubtitle()}>{subtitle}</p>
        <p className={cardMeta()}>{t("library:page.counts.tracks", { count: item.trackCount })}</p>
      </div>
    </li>
  );
}
