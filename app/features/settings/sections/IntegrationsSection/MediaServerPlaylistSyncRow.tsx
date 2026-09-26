"use client";

import { useTranslation } from "react-i18next";

import { Switch } from "@components/ui/Switch";

import { EngineRow } from "../../components/EngineRow";
import type { MediaServerPlaylistSyncRowProps } from "./types";

export function MediaServerPlaylistSyncRow({
  server,
  playback,
  playlistSync,
  onChange,
}: MediaServerPlaylistSyncRowProps) {
  const { t } = useTranslation("settings");
  const label = t("mediaServers.playlistSync.label", { server });

  return (
    <EngineRow
      label={label}
      description={
        playback
          ? t("mediaServers.playlistSync.description", { server })
          : t("mediaServers.playlistSync.needsPlayback", { server })
      }
      control={
        <Switch checked={playback && playlistSync} disabled={!playback} onCheckedChange={onChange} aria-label={label} />
      }
    />
  );
}
