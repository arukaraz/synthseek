"use client";

import { Popover, PopoverContent, PopoverTrigger } from "@components/ui/Popover";
import { Switch } from "@components/ui/Switch";
import { Info, Settings2 } from "lucide-react";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation("library");
  const activeCount = (value.playlists ? 1 : 0) + (value.savedAlbums ? 1 : 0);
  const active = activeCount > 0;
  const badgeLabel = active ? `${activeCount}/2` : t("spotifyLibrary.autoWatch.off");

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={autoImportTrigger({ active })}
          aria-label={t("spotifyLibrary.autoWatch.configureAria")}
        >
          <Settings2 className="size-3.5" />
          <span>{t("spotifyLibrary.autoWatch.trigger")}</span>
          <span className={autoImportBadge({ active })}>{badgeLabel}</span>
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" side="top" className={autoImportPopover()}>
        <div className={autoImportTitle()}>
          {t("spotifyLibrary.autoWatch.title")}
          <Popover>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="text-fg/40 hover:text-fg/70 inline-flex items-center justify-center"
                aria-label={t("spotifyLibrary.autoWatch.howAria")}
              >
                <Info className="size-3" />
              </button>
            </PopoverTrigger>
            <PopoverContent side="top" align="start" className="max-w-[260px] text-[11px] leading-relaxed">
              {t("spotifyLibrary.autoWatch.help")}
            </PopoverContent>
          </Popover>
        </div>
        <div className="flex flex-col gap-1">
          <label className={autoImportRow()}>
            <span className={autoImportRowLabel()}>
              {t("spotifyLibrary.autoWatch.newPlaylists")}
              <span className={autoImportRowSub()}>{t("spotifyLibrary.autoWatch.newPlaylistsSub")}</span>
            </span>
            <Switch
              checked={value.playlists}
              onCheckedChange={(v) => onChange({ playlists: Boolean(v) })}
              aria-label={t("spotifyLibrary.autoWatch.newPlaylistsAria")}
            />
          </label>
          <label className={autoImportRow()}>
            <span className={autoImportRowLabel()}>
              {t("spotifyLibrary.autoWatch.savedAlbums")}
              <span className={autoImportRowSub()}>{t("spotifyLibrary.autoWatch.savedAlbumsSub")}</span>
            </span>
            <Switch
              checked={value.savedAlbums}
              onCheckedChange={(v) => onChange({ savedAlbums: Boolean(v) })}
              aria-label={t("spotifyLibrary.autoWatch.savedAlbumsAria")}
            />
          </label>
        </div>
      </PopoverContent>
    </Popover>
  );
}
