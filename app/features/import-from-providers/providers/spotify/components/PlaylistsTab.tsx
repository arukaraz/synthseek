"use client";

import { Checkbox } from "@components/ui/Checkbox";
import { useSpotifyPlaylists } from "@hooks/api/queries/spotify/useSpotifyPlaylists";

import { emptyState, itemImage, itemSubtitle, itemTitle, list, listItem } from "../../../styles";

import type { PlaylistsTabProps } from "./types";

export function PlaylistsTab({ selected, sync, onToggle, onToggleSync }: PlaylistsTabProps) {
  const { data, isLoading, error } = useSpotifyPlaylists();

  if (isLoading) return <div className={emptyState()}>Loading playlists…</div>;
  if (error) return <div className={emptyState()}>{error.message}</div>;
  if (!data || data.length === 0) return <div className={emptyState()}>No playlists found.</div>;

  return (
    <div className={list()}>
      {data.map((playlist) => {
        const isSelected = selected.has(playlist.id);
        const isSync = sync.has(playlist.id);
        return (
          <div key={playlist.id} className={listItem()}>
            <Checkbox
              checked={isSelected}
              onCheckedChange={() => onToggle(playlist.id)}
              disabled={playlist.already_imported}
              aria-label={`Select ${playlist.name}`}
            />
            {playlist.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={playlist.image} alt="" className={itemImage()} />
            ) : (
              <div className={itemImage()} />
            )}
            <div className="flex flex-1 flex-col gap-0.5 min-w-0">
              <span className={itemTitle()}>
                {playlist.name}
                {playlist.already_imported && (
                  <span className="ml-2 text-emerald-400 text-xs">Already imported</span>
                )}
              </span>
              <span className={itemSubtitle()}>
                {playlist.owner.name} • {playlist.total_tracks} tracks
              </span>
            </div>
            <label className="flex items-center gap-1.5 text-xs text-fg/70">
              <Checkbox
                checked={isSync}
                onCheckedChange={() => onToggleSync(playlist.id)}
                disabled={!isSelected && !playlist.already_imported}
                aria-label={`Keep ${playlist.name} synced`}
              />
              Sync
            </label>
          </div>
        );
      })}
    </div>
  );
}
