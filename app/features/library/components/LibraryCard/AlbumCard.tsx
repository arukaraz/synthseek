"use client";

import { cn } from "@utils/cn";
import { artworkProxySrc } from "@utils/artworkProxy";
import Image from "next/image";
import { useTranslation } from "react-i18next";

import { CardCoverActions } from "./CardCoverActions";
import { albumMetaLine, cardCoverActionsFrom, cardInitials, handleCardActivationKey, statusDotClass } from "./helpers";
import {
  cardBody,
  cardCover,
  cardImage,
  cardInitials as cardInitialsStyle,
  cardMeta,
  cardRoot,
  cardStatusBadge,
  cardStatusDot,
  cardSubtitle,
  cardTitle,
} from "./styles";
import type { AlbumCardProps } from "./types";

export function AlbumCard({ item, onOpen, onPlay }: AlbumCardProps) {
  const { t } = useTranslation("contentDetail");
  const meta = albumMetaLine(item.year, item.quality);
  const coverActions = cardCoverActionsFrom(onOpen, onPlay);
  const activates = !!onOpen && coverActions === null;

  return (
    <li
      className={cardRoot({ interactive: activates })}
      role={activates ? "button" : undefined}
      tabIndex={activates ? 0 : undefined}
      aria-label={activates ? t("openDetail", { name: item.name }) : undefined}
      onClick={activates ? onOpen : undefined}
      onKeyDown={activates && onOpen ? (event) => handleCardActivationKey(event, onOpen) : undefined}
    >
      <div className={cardCover()}>
        {item.album_art ? (
          <Image
            src={artworkProxySrc(item.album_art)}
            alt=""
            fill
            sizes="(max-width: 640px) 50vw, 20vw"
            className={cardImage()}
          />
        ) : (
          <span aria-hidden className={cardInitialsStyle()}>
            {cardInitials(item.name)}
          </span>
        )}
        <span className={cardStatusBadge()}>
          <span className={cn(cardStatusDot(), statusDotClass(item.status))} />
          {item.completed_tracks}/{item.total_tracks}
        </span>
        {coverActions ? (
          <CardCoverActions name={item.name} onPlay={coverActions.play} onOpen={coverActions.open} />
        ) : null}
      </div>

      <div className={cardBody()}>
        <p className={cardTitle()}>{item.name}</p>
        <p className={cardSubtitle()}>{item.artist}</p>
        {meta ? <p className={cardMeta()}>{meta}</p> : null}
      </div>
    </li>
  );
}
