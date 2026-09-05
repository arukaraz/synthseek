"use client";

import { MonitorSpeaker } from "lucide-react";
import { useTranslation } from "react-i18next";

import { ScrobbleStatus } from "./ScrobbleStatus";
import { iconButton } from "./styles";
import type { PlayerProps } from "./types";

export function PlayerExtraControls({ view, actions }: PlayerProps) {
  const { t } = useTranslation("player");

  return (
    <>
      <ScrobbleStatus
        state={view.scrobble}
        actionable={view.scrobbleActionable}
        size="bar"
        onToggle={actions.toggleScrobbling}
      />
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
    </>
  );
}
