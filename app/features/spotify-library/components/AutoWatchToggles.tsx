"use client";

import { Switch } from "@components/ui/Switch";

import { watchGroup, watchLabel, watchToggle } from "../styles";
import type { AutoWatchTogglesProps } from "./types";

export function AutoWatchToggles({ value, onChange }: AutoWatchTogglesProps) {
  return (
    <div className={watchGroup()}>
      <span className={watchLabel()}>Auto-watch:</span>
      <label className={watchToggle()}>
        <Switch
          checked={value.playlists}
          onCheckedChange={(v) => onChange({ playlists: Boolean(v) })}
          aria-label="Watch new playlists"
        />
        playlists
      </label>
      <label className={watchToggle()}>
        <Switch
          checked={value.liked}
          onCheckedChange={(v) => onChange({ liked: Boolean(v) })}
          aria-label="Watch liked songs"
        />
        liked
      </label>
      <label className={watchToggle()}>
        <Switch
          checked={value.savedAlbums}
          onCheckedChange={(v) => onChange({ savedAlbums: Boolean(v) })}
          aria-label="Watch saved albums"
        />
        albums
      </label>
    </div>
  );
}
