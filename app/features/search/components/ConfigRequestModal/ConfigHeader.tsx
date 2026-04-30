"use client";

import { Badge } from "@components/ui/Badge";
import { ContentType } from "@api/__generated__/types";
import { cn } from "@utils/cn";
import {
  getContentTypeBadgeColors,
  getContentTypeIcon,
  getContentTypeLabel,
} from "@utils/content-type-helpers";
import { configHeader } from "../styles";
import Image from "next/image";
import type { ConfigHeaderProps } from "./types";

export function ConfigHeader({ name, artist, image, year, itemType, totalTracks, albumName }: ConfigHeaderProps) {
  const isTrack = itemType === ContentType.enum.track;
  const PlaceholderIcon = getContentTypeIcon(itemType);

  return (
    <div className="h-config-header-responsive relative overflow-hidden rounded-t-2xl" data-cy="config-header">
      {image ? (
        <Image src={image} alt={name} fill className="object-cover object-center" priority />
      ) : (
        <div className={configHeader()}>
          <PlaceholderIcon className="text-primary-400/50 h-16 w-16" />
        </div>
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-black/40" />

      <div className="absolute right-0 bottom-0 left-0 z-10 p-4">
        <div className="flex items-end gap-3">
          <div className="min-w-0 flex-1 space-y-0.5">
            <Badge className={cn("text-overlay-fg mb-1 border-0", getContentTypeBadgeColors(itemType))}>
              {getContentTypeLabel(itemType)}
            </Badge>

            <h2
              className="text-overlay-fg truncate text-xl font-bold drop-shadow-lg sm:text-2xl"
              data-cy="config-item-title"
            >
              {name}
            </h2>

            {artist && <p className="text-overlay-fg/80 truncate text-sm">{artist}</p>}

            <div className="text-overlay-fg/60 flex items-center gap-2 text-xs">
              {isTrack && albumName && <span className="text-primary-400/80 truncate">{albumName}</span>}
              {year && <span>{year}</span>}
              {totalTracks && (
                <span>
                  {totalTracks} {totalTracks === 1 ? "track" : "tracks"}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
