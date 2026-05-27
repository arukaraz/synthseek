"use client";

import { Heart } from "lucide-react";

import { Checkbox } from "@components/ui/Checkbox";
import { useSpotifyLikedCount } from "@hooks/api/queries/spotify/useSpotifyLikedCount";

import { emptyState, helperText, itemImage, itemSubtitle, itemTitle, list, listItem } from "../../../styles";

import type { LikedSongsTabProps } from "./types";

export function LikedSongsTab({ imported, enableSync, onToggleImport, onToggleSync }: LikedSongsTabProps) {
  const { data, isLoading, error } = useSpotifyLikedCount();

  if (isLoading) return <div className={emptyState()}>Loading liked songs…</div>;
  if (error) return <div className={emptyState()}>{error.message}</div>;
  if (!data) return <div className={emptyState()}>No data.</div>;

  return (
    <div className={list()}>
      <div className={listItem()}>
        <Checkbox
          checked={imported}
          onCheckedChange={(checked) => onToggleImport(Boolean(checked))}
          disabled={data.alreadyImported}
          aria-label="Import Spotify Liked Songs"
        />
        <div className={itemImage() + " flex items-center justify-center"}>
          <Heart className="size-6 text-rose-400" />
        </div>
        <div className="flex flex-1 flex-col gap-0.5">
          <span className={itemTitle()}>
            Liked Songs (Spotify)
            {data.alreadyImported && <span className="ml-2 text-emerald-400 text-xs">Already imported</span>}
          </span>
          <span className={itemSubtitle()}>{data.total} tracks</span>
        </div>
        <label className="flex items-center gap-1.5 text-xs text-fg/70">
          <Checkbox
            checked={enableSync}
            onCheckedChange={(checked) => onToggleSync(Boolean(checked))}
            disabled={!imported && !data.alreadyImported}
            aria-label="Keep Liked Songs synced"
          />
          Sync
        </label>
      </div>
      <p className={helperText()}>
        Imported as a single Synthseek playlist called &quot;Liked Songs (Spotify)&quot;.
      </p>
    </div>
  );
}
