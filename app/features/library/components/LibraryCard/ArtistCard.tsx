"use client";

import Image from "next/image";
import { useTranslation } from "react-i18next";

import { useListPosition } from "@hooks/ui/useListPosition";
import { artworkImage } from "@utils/artworkProxy";
import { listPositionAttributes } from "@utils/list-position";

import { CardCoverActions } from "./CardCoverActions";
import { CardPlayButton } from "./CardPlayButton";
import { artistSubtitle, cardInitials, onOwnClick } from "./helpers";
import { RowPrimaryButton } from "./RowPrimaryButton";
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
  const position = useListPosition();
  const subtitle = artistSubtitle(item, t("library:page.counts.albums", { count: item.albumCount }));
  const cover = isResolving ? null : (image ?? item.albumArt);
  const activates = onOpen !== undefined;

  return (
    <li
      data-part="media-tile"
      data-type="artist"
      {...listPositionAttributes(position)}
      className={cardRoot({ interactive: activates })}
      onClick={onOpen ? onOwnClick(onOpen) : undefined}
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
        <p className={cardTitle()} data-part="media-tile-title">
          {activates ? (
            <RowPrimaryButton label={t("contentDetail:openDetail", { name: item.artist })}>
              {item.artist}
            </RowPrimaryButton>
          ) : (
            item.artist
          )}
        </p>
        <p className={cardSubtitle()}>{subtitle}</p>
        <p className={cardMeta()}>{t("library:page.counts.tracks", { count: item.trackCount })}</p>
      </div>
    </li>
  );
}
