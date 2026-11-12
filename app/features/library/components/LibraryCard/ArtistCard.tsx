"use client";

import Image from "next/image";
import { useTranslation } from "react-i18next";

import { artworkImage } from "@utils/artworkProxy";

import { CardCoverActions } from "./CardCoverActions";
import { CardPlayButton } from "./CardPlayButton";
import { artistSubtitle, cardInitials, handleCardActivationKey, onOwnClick } from "./helpers";
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

export function ArtistCard({ item, image, isResolving = false, onOpen, onPlay, chrome = "overlay" }: ArtistCardProps) {
  const { t } = useTranslation(["library", "contentDetail"]);
  const subtitle = artistSubtitle(item, t("library:page.counts.albums", { count: item.albumCount }));
  const cover = isResolving ? null : (image ?? item.albumArt);
  const activates = onOpen !== undefined;

  return (
    <li
      className={cardRoot({ interactive: activates })}
      role={activates ? "button" : undefined}
      tabIndex={activates ? 0 : undefined}
      aria-label={activates ? t("contentDetail:openDetail", { name: item.artist }) : undefined}
      onClick={onOpen ? onOwnClick(onOpen) : undefined}
      onKeyDown={activates && onOpen ? (event) => handleCardActivationKey(event, onOpen) : undefined}
    >
      <div className={cardCover()}>
        {cover ? (
          <Image {...artworkImage(cover)} alt="" fill sizes="(max-width: 640px) 50vw, 20vw" className={cardImage()} />
        ) : (
          <span aria-hidden className={cardInitialsStyle()}>
            {cardInitials(item.artist)}
          </span>
        )}
        {onPlay && chrome === "overlay" ? (
          <CardCoverActions name={item.artist} order="shuffled" onPlay={onPlay} />
        ) : null}
        {onPlay && chrome === "corner" ? (
          <CardPlayButton name={item.artist} order="shuffled" onPlay={onPlay} placement="corner" />
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
