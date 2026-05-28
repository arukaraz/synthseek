"use client";

import { Popover, PopoverContent, PopoverTrigger } from "@components/ui/Popover";
import { Switch } from "@components/ui/Switch";
import { Info, Settings2 } from "lucide-react";

import {
  autoImportBadge,
  autoImportPopover,
  autoImportRow,
  autoImportRowLabel,
  autoImportRowSub,
  autoImportTitle,
  autoImportTrigger,
} from "../styles";
import type { AutoWatchTogglesProps } from "./types";

export function AutoWatchToggles({ value, onChange }: AutoWatchTogglesProps) {
  const activeCount = (value.playlists ? 1 : 0) + (value.savedAlbums ? 1 : 0);
  const active = activeCount > 0;
  const badgeLabel = active ? `${activeCount}/2` : "off";

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button type="button" className={autoImportTrigger({ active })} aria-label="Configure auto-import settings">
          <Settings2 className="size-3.5" />
          <span>Auto-import</span>
          <span className={autoImportBadge({ active })}>{badgeLabel}</span>
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" side="top" className={autoImportPopover()}>
        <div className={autoImportTitle()}>
          Auto-import new
          <Popover>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="text-fg/40 hover:text-fg/70 inline-flex items-center justify-center"
                aria-label="How does auto-import work?"
              >
                <Info className="size-3" />
              </button>
            </PopoverTrigger>
            <PopoverContent side="top" align="start" className="max-w-[260px] text-[11px] leading-relaxed">
              Items added to your Spotify library after enabling get imported automatically by the background sync.
              Existing items are not touched. Disable any time, already-imported items stay.
            </PopoverContent>
          </Popover>
        </div>
        <div className="flex flex-col gap-1">
          <label className={autoImportRow()}>
            <span className={autoImportRowLabel()}>
              New playlists
              <span className={autoImportRowSub()}>Playlists added to your library</span>
            </span>
            <Switch
              checked={value.playlists}
              onCheckedChange={(v) => onChange({ playlists: Boolean(v) })}
              aria-label="Auto-import new playlists"
            />
          </label>
          <label className={autoImportRow()}>
            <span className={autoImportRowLabel()}>
              Saved albums
              <span className={autoImportRowSub()}>Albums you save in Spotify</span>
            </span>
            <Switch
              checked={value.savedAlbums}
              onCheckedChange={(v) => onChange({ savedAlbums: Boolean(v) })}
              aria-label="Auto-import new saved albums"
            />
          </label>
        </div>
      </PopoverContent>
    </Popover>
  );
}
