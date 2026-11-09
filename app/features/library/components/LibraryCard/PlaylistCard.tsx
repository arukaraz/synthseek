"use client";

import { cn } from "@utils/cn";
import { artworkImage } from "@utils/artworkProxy";
import { playlistOriginLabel } from "@utils/playlist";
import Image from "next/image";
import { useTranslation } from "react-i18next";

import { CardCoverActions } from "./CardCoverActions";
import { CardPlayButton } from "./CardPlayButton";
import {
  cardCoverActionsFrom,
  cardInitials,
  handleCardActivationKey,
  mosaicTiles,
  onOwnClick,
  playlistSubtitle,
  statusDotClass,
} from "./helpers";
import { PlaylistCardMenu } from "./PlaylistCardMenu";
import {
  cardBody,
  cardBodyRow,
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

export function PlaylistCard({ item, onOpen, onPlay, chrome = "overlay" }: PlaylistCardProps) {
  const { t } = useTranslation("library");
  const { t: tDetail } = useTranslation("contentDetail");
  const tiles = mosaicTiles(item.images, item.image);
  const origin = playlistOriginLabel(item.origin, t);
  const coverActions = chrome === "overlay" ? cardCoverActionsFrom(onOpen, onPlay) : null;
  const activates = !!onOpen && coverActions === null;
  const openLabel = activates ? tDetail("openDetail", { name: item.name }) : undefined;

  return (
    <li
      className={cardRoot({ interactive: activates })}
      role={activates ? "button" : undefined}
      tabIndex={activates ? 0 : undefined}
      aria-label={openLabel}
      onClick={activates && onOpen ? onOwnClick(onOpen) : undefined}
      onKeyDown={activates && onOpen ? (event) => handleCardActivationKey(event, onOpen) : undefined}
    >
      <div className={cardCover()}>
        {tiles.length === 0 ? (
          <span aria-hidden className={cardInitialsStyle()}>
            {cardInitials(item.name)}
          </span>
        ) : tiles.length === 1 ? (
          <Image
            {...artworkImage(tiles[0])}
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
                  {...artworkImage(src)}
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
        {chrome === "overlay" ? <PlaylistCardMenu item={item} /> : null}
        {coverActions ? (
          <CardCoverActions name={item.name} order="inOrder" onPlay={coverActions.play} onOpen={coverActions.open} />
        ) : null}
        {onPlay && chrome === "corner" ? (
          <CardPlayButton name={item.name} order="inOrder" onPlay={onPlay} placement="corner" />
        ) : null}
      </div>

      <div className={cardBodyRow()}>
        <div className={cardBody()}>
          <p className={cardTitle()}>{item.name}</p>
          <p className={cardSubtitle()}>{playlistSubtitle(item, origin, t)}</p>
          <p className={cardMeta()}>{t("page.counts.tracks", { count: item.total_tracks })}</p>
        </div>
        {chrome === "corner" ? <PlaylistCardMenu item={item} appearance="inline" /> : null}
      </div>
    </li>
  );
}
