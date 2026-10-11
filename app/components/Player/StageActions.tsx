"use client";

import { Mic2, MonitorSpeaker, Settings2 } from "lucide-react";
import { useTranslation } from "react-i18next";

import { FavouriteButton } from "./FavouriteButton";
import { ScrobbleStatus } from "./ScrobbleStatus";
import { UpgradeButton } from "./UpgradeButton";
import { labelled } from "./helpers";
import { iconButton } from "./styles";
import type { StageActionsProps } from "./types";

export function StageActions({ view, actions }: StageActionsProps) {
  const { t } = useTranslation("player");

  return (
    <>
      <FavouriteButton view={view} actions={actions} size="stage" />
      <UpgradeButton view={view} actions={actions} size="stage" />
      <ScrobbleStatus
        state={view.scrobble}
        actionable={view.scrobbleActionable}
        size="stage"
        onToggle={actions.toggleScrobbling}
      />
      <button
        type="button"
        className={iconButton({ tone: view.lyricsOpen ? "active" : "muted", size: "stage" })}
        onClick={actions.toggleLyrics}
        {...labelled(t("controls.lyrics"))}
        aria-pressed={view.lyricsOpen}
      >
        <Mic2 className="size-4" />
      </button>
      <button
        type="button"
        className={iconButton({ tone: view.settingsOpen ? "active" : "muted", size: "stage" })}
        onClick={actions.toggleSettings}
        {...labelled(t("controls.settings"))}
        aria-expanded={view.settingsOpen}
        data-player-settings-toggle
      >
        <Settings2 className="size-4" />
      </button>
      <button
        type="button"
        className={iconButton({ tone: view.activeDevice.local ? "muted" : "remote", size: "stage" })}
        onClick={actions.toggleDevices}
        {...labelled(t("controls.devices"))}
        aria-expanded={view.devicesOpen}
        data-player-devices-toggle
      >
        <MonitorSpeaker className="size-4" />
      </button>
    </>
  );
}
