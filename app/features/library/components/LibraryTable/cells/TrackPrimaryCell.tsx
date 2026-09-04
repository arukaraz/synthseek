"use client";

import { ImagePlaceholder } from "@components/ui/ImagePlaceholder";
import { artworkProxySrc } from "@utils/artworkProxy";
import { Music, Play } from "lucide-react";
import Image from "next/image";
import { useTranslation } from "react-i18next";

import { primaryCellArtwork, primaryCellPlay, primaryCellRow, primaryCellText, primaryCellTitle } from "../styles";
import type { TrackPrimaryCellProps } from "./types";

export function TrackPrimaryCell({ item, onPlay }: TrackPrimaryCellProps) {
  const { t } = useTranslation("library");

  return (
    <div className={primaryCellRow()}>
      <div className={primaryCellArtwork()}>
        {item.albumArt ? (
          <Image
            src={artworkProxySrc(item.albumArt)}
            alt=""
            width={40}
            height={40}
            className="rounded-md object-cover"
          />
        ) : (
          <ImagePlaceholder size="sm" icon={Music} />
        )}
        {item.playable ? (
          <button
            type="button"
            className={primaryCellPlay()}
            onClick={(event) => {
              event.stopPropagation();
              onPlay(item.id);
            }}
            aria-label={t("page.actions.playTrack", { title: item.title })}
          >
            <Play className="size-4 fill-current" />
          </button>
        ) : null}
      </div>
      <div className={primaryCellText()}>
        <p className={primaryCellTitle()}>{item.title}</p>
      </div>
    </div>
  );
}
