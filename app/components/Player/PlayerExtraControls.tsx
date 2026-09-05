"use client";

import { cn } from "@utils/cn";
import { Mic2, MonitorSpeaker, Repeat, Repeat1, Shuffle } from "lucide-react";
import { useTranslation } from "react-i18next";

import { FavouriteButton } from "./FavouriteButton";
import { ScrobbleStatus } from "./ScrobbleStatus";
import { iconButton } from "./styles";
import type { PlayerProps } from "./types";

export function PlayerExtraControls({ view, actions }: PlayerProps) {
  const { t } = useTranslation("player");

  return (
    <>
      <button
        type="button"
        className={cn(iconButton({ tone: view.shuffle ? "active" : "muted" }), "sm:hidden")}
        onClick={actions.toggleShuffle}
        aria-label={t("controls.shuffle")}
        aria-pressed={view.shuffle}
      >
        <Shuffle className="size-5" />
      </button>
      <button
        type="button"
        className={cn(iconButton({ tone: view.repeat === "off" ? "muted" : "active" }), "sm:hidden")}
        onClick={actions.cycleRepeat}
        aria-label={t(`controls.repeat.${view.repeat}`)}
      >
        {view.repeat === "one" ? <Repeat1 className="size-5" /> : <Repeat className="size-5" />}
      </button>
      <FavouriteButton view={view} actions={actions} className="hidden sm:grid" />
      <ScrobbleStatus
        state={view.scrobble}
        actionable={view.scrobbleActionable}
        size="bar"
        onToggle={actions.toggleScrobbling}
      />
      <button
        type="button"
        className={iconButton({ tone: view.lyricsOpen ? "active" : "muted" })}
        onClick={actions.openLyrics}
        aria-label={t("controls.lyrics")}
      >
        <Mic2 className="size-5 sm:size-4" />
      </button>
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
