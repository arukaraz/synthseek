"use client";

import { useTranslation } from "react-i18next";

import { Switch } from "@components/ui/Switch";

import { EngineRow } from "../../components/EngineRow";
import type { MediaServerPlaylistSyncRowProps } from "./types";

export function MediaServerPlaylistSyncRow({
  server,
  connected,
  playlistSync,
  onChange,
}: MediaServerPlaylistSyncRowProps) {
  const { t } = useTranslation("settings");
  const label = t("mediaServers.playlistSync.label", { server });

  return (
    <EngineRow
      label={label}
      description={
        connected
          ? t("mediaServers.playlistSync.description", { server })
          : t("mediaServers.playlistSync.needsConnection", { server })
      }
      control={
        <Switch
          checked={connected && playlistSync}
          disabled={!connected}
          onCheckedChange={onChange}
          aria-label={label}
        />
      }
    />
  );
}
