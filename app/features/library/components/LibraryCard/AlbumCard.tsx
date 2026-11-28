"use client";

import { Checkbox } from "@components/ui/Checkbox";
import { useListPosition } from "@hooks/ui/useListPosition";
import { useLongPress } from "@hooks/ui/useLongPress";
import { artworkImage } from "@utils/artworkProxy";
import { listPositionAttributes } from "@utils/list-position";
import Image from "next/image";
import { useTranslation } from "react-i18next";

import { CardCoverActions } from "./CardCoverActions";
import { CardPlayButton } from "./CardPlayButton";
import { CardStatusDot } from "./CardStatusDot";
import { albumMetaLine, cardCoverTone, cardInitials, onOwnClick } from "./helpers";
import { RowPrimaryButton } from "./RowPrimaryButton";
import {
  cardBody,
  cardBodyRow,
  cardCover,
  cardImage,
  cardInitials as cardInitialsStyle,
  cardMeta,
  cardRoot,
  cardSelectBox,
  cardSelectCheckbox,
  cardStatusBadge,
  cardSubtitle,
  cardTitle,
} from "./styles";
import type { AlbumCardProps } from "./types";

export function AlbumCard({
  item,
  showLibraryPaths = false,
  onOpen,
  onPlay,
  menu,
  selection,
  chrome = "overlay",
  onHold,
}: AlbumCardProps) {
  const longPress = useLongPress(onHold);
  const position = useListPosition();
  const { t } = useTranslation(["contentDetail", "library"]);
  const meta = albumMetaLine(
    item.year,
    item.quality,
    showLibraryPaths ? item.libraryPaths.map((path) => path.label) : []
  );
  const selecting = selection?.selecting === true;
  const activates = onOpen !== undefined || selecting;
  const selectLabel = t("library:page.selection.selectAlbum", { name: item.name });

  const activate = (extend: boolean) => {
    if (selection?.selecting) selection.onToggle(extend);
    else onOpen?.();
  };

  return (
    <li
      data-part="media-tile"
      data-type="album"
      {...listPositionAttributes(position)}
      className={cardRoot({ interactive: activates })}
      onClick={activates ? onOwnClick((event) => activate(event.shiftKey)) : undefined}
      onMouseDown={
        selecting
          ? (event) => {
              if (event.shiftKey) event.preventDefault();
            }
          : undefined
      }
      onMouseEnter={selection ? () => selection.onHover(true) : undefined}
      onMouseLeave={selection ? () => selection.onHover(false) : undefined}
      {...longPress}
    >
      <div className={cardCover({ tone: cardCoverTone(selection) })}>
        {item.album_art ? (
          <Image
            {...artworkImage(item.album_art)}
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
          <CardStatusDot status={item.status} />
          {item.completed_tracks}/{item.total_tracks}
        </span>
        {onPlay && chrome === "overlay" ? <CardCoverActions name={item.name} order="inOrder" onPlay={onPlay} /> : null}
        {onPlay && chrome === "corner" && !selecting ? (
          <CardPlayButton name={item.name} order="inOrder" onPlay={onPlay} placement="corner" />
        ) : null}
        {selection && (chrome === "overlay" || selecting) ? (
          <div
            className={cardSelectBox({ shown: selecting })}
            onMouseDownCapture={(event) => {
              if (event.shiftKey) event.preventDefault();
            }}
            onClickCapture={(event) => {
              event.preventDefault();
              selection.onToggle(event.shiftKey);
            }}
            onClick={(event) => event.stopPropagation()}
          >
            <Checkbox
              checked={selection.selected}
              preview={selection.preview}
              aria-label={selectLabel}
              className={cardSelectCheckbox()}
            />
          </div>
        ) : null}
      </div>

      <div className={cardBodyRow()}>
        <div className={cardBody()}>
          <p className={cardTitle()} data-part="media-tile-title">
            {activates ? (
              <RowPrimaryButton
                label={selecting ? selectLabel : t("contentDetail:openDetail", { name: item.name })}
                pressed={selecting ? selection?.selected : undefined}
              >
                {item.name}
              </RowPrimaryButton>
            ) : (
              item.name
            )}
          </p>
          <p className={cardSubtitle()}>{item.artist}</p>
          {meta ? <p className={cardMeta()}>{meta}</p> : null}
        </div>
        {selecting ? null : menu}
      </div>
    </li>
  );
}
