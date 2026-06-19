"use client";

import { Switch } from "@components/ui/Switch";
import { RefreshCw } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { heroSyncToggle, heroSyncToggleIcon } from "./styles";
import type { PlaylistSyncToggleProps } from "./types";

export function PlaylistSyncToggle({ syncEnabled, onToggle, disabled }: PlaylistSyncToggleProps) {
  const { t } = useTranslation("library");
  const label = t("playlists.keepInSync");
  const [rotation, setRotation] = useState(0);

  const handleCheckedChange = (next: boolean) => {
    setRotation((current) => current + (next ? 360 : -360));
    onToggle(next);
  };

  return (
    <span className={heroSyncToggle()} title={label}>
      <RefreshCw
        className={heroSyncToggleIcon({ active: syncEnabled })}
        style={{ transform: `rotate(${rotation}deg)` }}
        data-rotation={rotation}
        aria-hidden
      />
      <Switch checked={syncEnabled} onCheckedChange={handleCheckedChange} disabled={disabled} aria-label={label} />
    </span>
  );
}
