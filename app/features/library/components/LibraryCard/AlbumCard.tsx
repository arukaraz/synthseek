"use client";

import { cn } from "@utils/cn";
import Image from "next/image";

import { albumMetaLine, cardInitials, statusDotClass } from "./helpers";
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

export function AlbumCard({ item }: AlbumCardProps) {
  const meta = albumMetaLine(item.year, item.quality);

  return (
    <li className={cardRoot()}>
      <div className={cardCover()}>
        {item.album_art ? (
          <Image src={item.album_art} alt="" fill sizes="(max-width: 640px) 50vw, 20vw" className={cardImage()} />
        ) : (
          <span aria-hidden className={cardInitialsStyle()}>
            {cardInitials(item.name)}
          </span>
        )}
        <span className={cardStatusBadge()}>
          <span className={cn(cardStatusDot(), statusDotClass(item.status))} />
          {item.completed_tracks}/{item.total_tracks}
        </span>
      </div>

      <div className={cardBody()}>
        <p className={cardTitle()}>{item.name}</p>
        <p className={cardSubtitle()}>{item.artist}</p>
        {meta ? <p className={cardMeta()}>{meta}</p> : null}
      </div>
    </li>
  );
}
