"use client";

import { Checkbox } from "@components/ui/Checkbox";
import { useSpotifySavedAlbums } from "@hooks/api/queries/spotify/useSpotifySavedAlbums";

import { emptyState, itemImage, itemSubtitle, itemTitle, list, listItem } from "../../../styles";

import type { SavedAlbumsTabProps } from "./types";

export function SavedAlbumsTab({ selected, onToggle }: SavedAlbumsTabProps) {
  const { data, isLoading, error } = useSpotifySavedAlbums();

  if (isLoading) return <div className={emptyState()}>Loading saved albums…</div>;
  if (error) return <div className={emptyState()}>{error.message}</div>;
  if (!data || data.length === 0) return <div className={emptyState()}>No saved albums.</div>;

  return (
    <div className={list()}>
      {data.map((album) => (
        <div key={album.id} className={listItem()}>
          <Checkbox
            checked={selected.has(album.id)}
            onCheckedChange={() => onToggle(album.id)}
            disabled={album.already_imported}
            aria-label={`Select ${album.name}`}
          />
          {album.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={album.image} alt="" className={itemImage()} />
          ) : (
            <div className={itemImage()} />
          )}
          <div className="flex flex-1 flex-col gap-0.5 min-w-0">
            <span className={itemTitle()}>
              {album.name}
              {album.already_imported && (
                <span className="ml-2 text-emerald-400 text-xs">Already imported</span>
              )}
            </span>
            <span className={itemSubtitle()}>
              {album.artist} • {album.total_tracks} tracks • {album.release_date}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
