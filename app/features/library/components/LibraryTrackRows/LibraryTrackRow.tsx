"use client";

import { TrackStatusIndicator } from "@components/TrackStatusIndicator";
import { Checkbox } from "@components/ui/Checkbox";
import { ImagePlaceholder } from "@components/ui/ImagePlaceholder";
import { useLongPress } from "@hooks/ui/useLongPress";
import { artworkImage } from "@utils/artworkProxy";
import { Music, Play } from "lucide-react";
import Image from "next/image";
import { useTranslation } from "react-i18next";

import { handleCardActivationKey, joinMeta, onOwnClick, shieldOwnClick } from "../LibraryCard/helpers";
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
  const activates = selecting || item.playable;
  const activate = () => {
    if (selecting) onToggle();
    else if (item.playable) onPlay(item.id);
  };

  return (
    <li
      className={trackRow({ selected })}
      role={activates ? "button" : undefined}
      tabIndex={activates ? 0 : undefined}
      aria-pressed={selecting ? selected : undefined}
      aria-label={
        selecting
          ? t("page.selection.selectTrack", { title: item.title })
          : t("page.actions.playTrack", { title: item.title })
      }
      onClick={activates ? onOwnClick(activate) : undefined}
      onKeyDown={activates ? (event) => handleCardActivationKey(event, activate) : undefined}
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
        <p className={trackRowTitle()}>{item.title}</p>
        <p className={trackRowSubtitle()}>{joinMeta([item.artist, item.albumName])}</p>
        {item.status === "complete" ? null : <TrackStatusIndicator status={item.status} className={trackRowStatus()} />}
      </div>
      <LibraryDurationCell durationMs={item.duration_ms} />
      {selecting ? null : (
        <div onClick={shieldOwnClick} onKeyDown={(event) => event.stopPropagation()}>
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
