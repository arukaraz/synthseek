"use client";

import { Checkbox } from "@components/ui/Checkbox";
import { useLongPress } from "@hooks/ui/useLongPress";
import { cn } from "@utils/cn";
import { artworkImage } from "@utils/artworkProxy";
import Image from "next/image";
import { useTranslation } from "react-i18next";

import { CardCoverActions } from "./CardCoverActions";
import { CardPlayButton } from "./CardPlayButton";
import {
  albumMetaLine,
  cardCoverTone,
  cardInitials,
  handleCardActivationKey,
  onOwnClick,
  shieldCardActivationKey,
  statusDotClass,
} from "./helpers";
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
  cardStatusDot,
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
      className={cardRoot({ interactive: activates })}
      role={activates ? "button" : undefined}
      tabIndex={activates ? 0 : undefined}
      aria-label={selecting ? selectLabel : activates ? t("contentDetail:openDetail", { name: item.name }) : undefined}
      aria-pressed={selecting ? selection?.selected : undefined}
      onClick={activates ? onOwnClick((event) => activate(event.shiftKey)) : undefined}
      onKeyDown={activates ? (event) => handleCardActivationKey(event, () => activate(event.shiftKey)) : undefined}
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
          <span className={cn(cardStatusDot(), statusDotClass(item.status))} />
          {item.completed_tracks}/{item.total_tracks}
        </span>
        {onPlay && chrome === "overlay" ? (
          <CardCoverActions name={item.name} order="inOrder" onPlay={onPlay} menu={menu} />
        ) : null}
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
            onKeyDown={shieldCardActivationKey}
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
          <p className={cardTitle()}>{item.name}</p>
          <p className={cardSubtitle()}>{item.artist}</p>
          {meta ? <p className={cardMeta()}>{meta}</p> : null}
        </div>
        {chrome === "corner" && !selecting ? menu : null}
      </div>
    </li>
  );
}
