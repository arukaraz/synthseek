"use client";

import { TrackStatusIndicator } from "@components/TrackStatusIndicator";
import { Checkbox } from "@components/ui/Checkbox";
import { ImagePlaceholder } from "@components/ui/ImagePlaceholder";
import { useListPosition } from "@hooks/ui/useListPosition";
import { useLongPress } from "@hooks/ui/useLongPress";
import { artworkImage } from "@utils/artworkProxy";
import { listPositionAttributes } from "@utils/list-position";
import { Music, Play } from "lucide-react";
import Image from "next/image";
import { useTranslation } from "react-i18next";

import { joinMeta, onOwnClick, shieldOwnClick } from "../LibraryCard/helpers";
import { RowPrimaryButton } from "../LibraryCard/RowPrimaryButton";
import { LibraryDurationCell } from "../LibraryTable/cells/LibraryDurationCell";
import { TrackActionsCell } from "../LibraryTable/cells/TrackActionsCell";
import {
  trackRow,
  trackRowArt,
  trackRowCheck,
  trackRowPlay,
  trackRowStatus,
  trackRowSubtitle,
  trackRowText,
  trackRowTitle,
} from "./styles";
import type { LibraryTrackRowProps } from "./types";

export function LibraryTrackRow({
  item,
  selecting,
  selected,
  onToggle,
  onPlay,
  onEnqueue,
  onSearchBetterQuality,
  fileActions,
  onHold,
}: LibraryTrackRowProps) {
  const { t } = useTranslation("library");
  const longPress = useLongPress(onHold);
  const position = useListPosition();
  const activates = selecting || item.playable;
  const subtitle = joinMeta([item.artist, item.albumName]);
  const activate = () => {
    if (selecting) onToggle();
    else if (item.playable) onPlay(item.id);
  };

  return (
    <li
      {...listPositionAttributes(position)}
      className={trackRow({ selected })}
      onClick={activates ? onOwnClick(activate) : undefined}
      {...longPress}
    >
      {selecting ? <Checkbox checked={selected} tabIndex={-1} aria-hidden className={trackRowCheck()} /> : null}
      <div className={trackRowArt()}>
        {item.albumArt ? (
          <Image {...artworkImage(item.albumArt)} alt="" fill sizes="44px" className="object-cover" />
        ) : (
          <ImagePlaceholder size="sm" icon={Music} />
        )}
        {item.playable && !selecting ? (
          <span aria-hidden className={trackRowPlay()}>
            <Play className="size-4 fill-current" />
          </span>
        ) : null}
      </div>
      <div className={trackRowText()}>
        <p className={trackRowTitle()}>
          {activates ? (
            <RowPrimaryButton
              label={
                selecting
                  ? t("page.selection.selectTrack", { title: item.title })
                  : t("page.actions.playTrack", { title: item.title })
              }
              pressed={selecting ? selected : undefined}
            >
              {item.title}
            </RowPrimaryButton>
          ) : (
            item.title
          )}
        </p>
        <p className={trackRowSubtitle()}>{subtitle}</p>
        {item.status === "complete" ? null : <TrackStatusIndicator status={item.status} className={trackRowStatus()} />}
      </div>
      <LibraryDurationCell durationMs={item.duration_ms} />
      {selecting ? null : (
        <div onClick={shieldOwnClick}>
          <TrackActionsCell
            item={item}
            onEnqueue={onEnqueue}
            onSearchBetterQuality={onSearchBetterQuality}
            fileActions={fileActions}
          />
        </div>
      )}
    </li>
  );
}
