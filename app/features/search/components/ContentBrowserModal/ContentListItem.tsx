"use client";

import { Button } from "@components/ui/Button";
import { ContentType } from "@api/__generated__/types";
import { Download, ChevronRight } from "lucide-react";
import Image from "next/image";
import { cn } from "@utils/cn";
import { itemImage, trackListContainer } from "../styles";
import { getMusicItemName } from "@utils/content-type-helpers";
import { formatTrackDuration, formatYear } from "@utils/formatters";
import { useTranslation } from "react-i18next";
import { getItemImage } from "./helpers";
import type { ContentListItemProps } from "./types";

export function ContentListItem({ item, parentType, onActionClick, onNavigate, isClickable }: ContentListItemProps) {
  const { t } = useTranslation("search");
  const isArtistView = parentType === ContentType.enum.artist;
  const isAlbumView = parentType === ContentType.enum.album || parentType === ContentType.enum.playlist;
  const name = getMusicItemName(item) || t("browser.unknown");
  const imageUrl = getItemImage(item);

  const handleClick = () => {
    if (isClickable && onNavigate) onNavigate(item);
  };

  const handleActionClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onActionClick(item);
  };

  if (isArtistView && item.type === ContentType.enum.album) {
    const releaseYear = formatYear(item.release_date);
    const trackCount = item.total_tracks;

    return (
      <div
        onClick={handleClick}
        className={cn(
          "group flex items-center gap-4 rounded-lg p-3 transition-all",
          isClickable && "hover:bg-fg/5 cursor-pointer"
        )}
        data-cy="content-list-item"
      >
        <div className="relative shrink-0">
          {imageUrl ? (
            <Image src={imageUrl} alt={name} width={64} height={64} className="rounded-md object-cover" unoptimized />
          ) : (
            <div className={itemImage()} />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="text-fg truncate font-medium" data-cy="content-item-name">
            {name}
          </h3>
          <p className="text-fg/60 text-xs">
            {[releaseYear, trackCount ? t("browser.songCount", { count: trackCount }) : null]
              .filter(Boolean)
              .join(" • ")}
          </p>
        </div>

        {isClickable && (
          <div className="text-fg/40 group-hover:text-fg/70 shrink-0 transition-colors">
            <ChevronRight className="h-5 w-5" />
          </div>
        )}
      </div>
    );
  }

  if (isAlbumView && item.type === ContentType.enum.track) {
    const duration = "duration_ms" in item ? formatTrackDuration(item.duration_ms) : "";
    const artistNames = item.artists?.map((a) => a.name).join(", ");

    return (
      <div className={trackListContainer()} data-cy="content-list-item">
        <div className="text-fg/50 w-8 shrink-0 text-center text-xs font-medium">{item.track_number}</div>

        <div className="min-w-0 flex-1">
          <h3 className="text-fg truncate font-medium" data-cy="content-item-name">
            {name}
          </h3>
          {artistNames && <p className="text-fg/60 truncate text-xs">{artistNames}</p>}
        </div>

        <div className="text-fg/50 hidden shrink-0 text-xs sm:block">{duration}</div>

        <div className="shrink-0 opacity-0 transition-opacity group-hover:opacity-100">
          <Button
            onClick={handleActionClick}
            size="icon"
            variant="ghost"
            className="text-fg/70 hover:text-fg hover:bg-fg/10 h-8 w-8"
            data-cy="content-item-action-btn"
            aria-label={t("browser.requestTrack")}
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  return null;
}
