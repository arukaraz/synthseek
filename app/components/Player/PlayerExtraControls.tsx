"use client";

import { cn } from "@utils/cn";
import { Mic2, MonitorSpeaker, Repeat, Repeat1, Shuffle } from "lucide-react";
import { useTranslation } from "react-i18next";

import { MODE_MENU_ICON, RESTORE_MODE_ICON } from "./constants";
import { labelled } from "./helpers";
import { PlayerVolume } from "./PlayerVolume";
import { ScrobbleStatus } from "./ScrobbleStatus";
import { iconButton } from "./styles";
import type { PlayerExtraControlsProps } from "./types";

export function PlayerExtraControls({ view, actions, omitTransport = false }: PlayerExtraControlsProps) {
  const { t } = useTranslation("player");

  return (
    <>
      {omitTransport ? null : (
        <>
          <button
            type="button"
            className={cn(iconButton({ tone: view.shuffle ? "active" : "muted" }), "@player:hidden")}
            onClick={actions.toggleShuffle}
            {...labelled(t("controls.shuffle"))}
            aria-pressed={view.shuffle}
          >
            <Shuffle className="size-5" />
          </button>
          <button
            type="button"
            className={cn(iconButton({ tone: view.repeat === "off" ? "muted" : "active" }), "@player:hidden")}
            onClick={actions.cycleRepeat}
            {...labelled(t(`controls.repeat.${view.repeat}`))}
          >
            {view.repeat === "one" ? <Repeat1 className="size-5" /> : <Repeat className="size-5" />}
          </button>
        </>
      )}
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
        {...labelled(t("controls.lyrics"))}
      >
        <Mic2 className="@player:size-4 size-5" />
      </button>
      <PlayerVolume view={view} actions={actions} size="bar" />
      <button
        type="button"
        className={iconButton({ tone: view.activeDevice.local ? "muted" : "remote" })}
        onClick={actions.toggleDevices}
        {...labelled(t("controls.devices"))}
        aria-expanded={view.devicesOpen}
        data-player-devices-toggle
      >
        <MonitorSpeaker className="@player:size-4 size-5" />
      </button>
      {view.mode === "normal" ? (
        <button
          type="button"
          className={iconButton()}
          onClick={actions.toggleModes}
          {...labelled(t("controls.modes"))}
          aria-expanded={view.modesOpen}
          data-player-modes-toggle
        >
          <MODE_MENU_ICON className="@player:size-4 size-5" />
        </button>
      ) : (
        <button
          type="button"
          className={iconButton({ tone: "active" })}
          onClick={() => actions.selectMode("normal")}
          {...labelled(view.mode === "mini" ? t("controls.exitMini") : t("controls.restoreMode"))}
        >
          <RESTORE_MODE_ICON className="@player:size-4 size-5" />
        </button>
      )}
    </>
  );
}
