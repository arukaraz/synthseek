"use client";

import { Switch } from "@components/ui/Switch";
import { useTranslation } from "react-i18next";

import { heroSyncLabel, heroSyncToggle } from "./styles";
import type { PlaylistSyncToggleProps } from "./types";

export function PlaylistSyncToggle({ syncEnabled, onToggle, disabled }: PlaylistSyncToggleProps) {
  const { t } = useTranslation("library");

  return (
    <div className={heroSyncToggle()}>
      <span className={heroSyncLabel()}>{t("playlists.keepInSync")}</span>
      <Switch checked={syncEnabled} onCheckedChange={onToggle} disabled={disabled} />
    </div>
  );
}
