"use client";

import { cn } from "@utils/cn";
import { Heart, Mic2, MonitorSpeaker } from "lucide-react";
import { useTranslation } from "react-i18next";

import { ScrobbleStatus } from "./ScrobbleStatus";
import { iconButton } from "./styles";
import type { PlayerProps } from "./types";

export function PlayerExtraControls({ view, actions }: PlayerProps) {
  const { t } = useTranslation("player");

  return (
    <>
      <button
        type="button"
        className={iconButton({ tone: view.favorite ? "favorite" : "muted" })}
        onClick={actions.toggleFavorite}
        aria-label={view.favorite ? t("controls.unfavorite") : t("controls.favorite")}
        aria-pressed={view.favorite}
      >
        <Heart className={cn("size-5 sm:size-4", view.favorite ? "fill-current" : undefined)} />
      </button>
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
