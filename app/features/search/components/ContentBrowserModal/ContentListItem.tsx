"use client";

import { Button } from "@components/ui/Button";
import { ContentType, type SpotifyItem } from "@api/__generated__/types";
import { Download, ChevronRight } from "lucide-react";
import Image from "next/image";
import { cn } from "@utils/cn";
import { itemImage, trackListContainer } from "../styles";
import { formatTrackDuration, formatYear } from "@utils/formatters";

interface ContentListItemProps {
  item: SpotifyItem;
  parentType: ContentType;
  onActionClick: (item: SpotifyItem) => void;
  onNavigate?: (item: SpotifyItem) => void;
  isClickable?: boolean;
}

export function ContentListItem({ item, parentType, onActionClick, onNavigate, isClickable }: ContentListItemProps) {
  const isArtistView = parentType === ContentType.enum.artist;
  const isAlbumView = parentType === ContentType.enum.album;

  const albumItem = isArtistView ? (item as SpotifyApi.AlbumObjectSimplified) : null;
  const trackItem = isAlbumView ? (item as SpotifyApi.TrackObjectSimplified) : null;

  const handleClick = () => {
    if (isClickable && onNavigate) {
      onNavigate(item);
    }
  };

  const handleActionClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onActionClick(item);
  };

  if (isArtistView && albumItem) {
    const releaseYear = formatYear(albumItem.release_date);
    const trackCount = albumItem.total_tracks;

    return (
      <div
        onClick={handleClick}
        className={cn(
          "group flex items-center gap-4 rounded-lg p-3 transition-all",
          isClickable && "hover:bg-fg/5 cursor-pointer"
        )}
        data-cy="content-list-item"
      >
        <div className="relative flex-shrink-0">
          {albumItem.images?.[0]?.url ? (
            <Image
              src={albumItem.images[0].url}
              alt={albumItem.name}
              width={64}
              height={64}
              className="rounded-md object-cover"
            />
          ) : (
            <div className={itemImage()} />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="text-fg truncate font-medium" data-cy="content-item-name">
            {albumItem.name}
          </h3>
          <p className="text-fg/60 text-sm">
            {releaseYear && `${releaseYear} • `}
            {trackCount} {trackCount === 1 ? "song" : "songs"}
          </p>
        </div>

        {isClickable && (
          <div className="text-fg/40 group-hover:text-fg/70 flex-shrink-0 transition-colors">
            <ChevronRight className="h-5 w-5" />
          </div>
        )}
      </div>
    );
  }

  if (isAlbumView && trackItem) {
    const duration = formatTrackDuration(trackItem.duration_ms);
    const artists = trackItem.artists?.map((a) => a.name).join(", ");

    return (
      <div className={trackListContainer()} data-cy="content-list-item">
        <div className="text-fg/50 w-8 flex-shrink-0 text-center text-sm font-medium">{trackItem.track_number}</div>

        <div className="min-w-0 flex-1">
          <h3 className="text-fg truncate font-medium" data-cy="content-item-name">
            {trackItem.name}
          </h3>
          {artists && <p className="text-fg/60 truncate text-sm">{artists}</p>}
        </div>

        <div className="text-fg/50 hidden flex-shrink-0 text-sm sm:block">{duration}</div>

        <div className="flex-shrink-0 opacity-0 transition-opacity group-hover:opacity-100">
          <Button
            onClick={handleActionClick}
            size="icon"
            variant="ghost"
            className="text-fg/70 hover:text-fg hover:bg-fg/10 h-8 w-8"
            data-cy="content-item-action-btn"
            aria-label="Request track"
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  return null;
}
