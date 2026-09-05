"use client";

import { MonitorSpeaker } from "lucide-react";
import { useTranslation } from "react-i18next";

import { iconButton } from "./styles";
import type { PlayerProps } from "./types";

export function PlayerExtraControls({ view, actions }: PlayerProps) {
  const { t } = useTranslation("player");

  return (
    <button
      type="button"
      className={iconButton({ tone: view.activeDevice.local ? "muted" : "remote" })}
      onClick={actions.toggleDevices}
      aria-label={t("controls.devices")}
      aria-expanded={view.devicesOpen}
      data-player-devices-toggle
    >
      <MonitorSpeaker className="size-5 sm:size-4" />
    </button>
  );
}
