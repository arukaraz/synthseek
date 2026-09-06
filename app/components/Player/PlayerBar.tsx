"use client";

import { cn } from "@utils/cn";
import { ChevronLeft, ChevronRight, Info, Maximize, MonitorSpeaker } from "lucide-react";
import { useTranslation } from "react-i18next";

import { FavouriteButton } from "./FavouriteButton";
import { PlayerExtraControls } from "./PlayerExtraControls";
import { PlayerTransport } from "./PlayerTransport";
import { PlayerWave } from "./PlayerWave";
import { TrackCover } from "./TrackCover";
import { formatClock, labelled, percentOf, trackInitials } from "./helpers";
import {
  bar,
  barTop,
  barDesktopExtras,
  barDeviceLine,
  barExtras,
  barCoverButton,
  barIdentity,
  barNameButton,
  barNameRow,
  barTextColumn,
  barMobileProgress,
  barMobileProgressFill,
  barMoreGroup,
  barProgress,
  barSubtitle,
  barTitle,
  barTitleArtist,
  barTitleRow,
  barTitleStrong,
  barTransport,
  clock,
  iconButton,
  progressVars,
} from "./styles";
import type { PlayerBarProps } from "./types";

export function PlayerBar({ view, actions, placement = "dock" }: PlayerBarProps) {
  const { t } = useTranslation("player");
  const progress = percentOf(view.positionSeconds, view.track.durationSeconds);

  return (
    <div className={bar({ placement })}>
      <div className={barMobileProgress()} style={progressVars(progress)}>
        <div className={barMobileProgressFill()} />
      </div>

      <div className={barTop()}>
        <div className={barIdentity()}>
          <button
            type="button"
            className={barCoverButton()}
            onClick={actions.toggleFullscreen}
            {...labelled(t("controls.openTrack"))}
          >
            <TrackCover
              initials={trackInitials(view.track.album)}
              tone={view.track.tone}
              size="bar"
              artworkUrl={view.track.artworkUrl}
            />
          </button>
          <span className={barTextColumn({ folded: view.moreOpen })}>
            <span className={barNameRow()}>
              <button type="button" className={barNameButton()} onClick={actions.toggleFullscreen} tabIndex={-1}>
                <span className={barTitle()}>{view.track.title}</span>
                <span className={barTitleRow()}>
                  <span className={barTitleStrong()}>{view.track.title}</span>
                  <span className={barTitleArtist()}> · {view.track.artist}</span>
                </span>
              </button>
              {placement === "dock" ? (
                <button
                  type="button"
                  className={iconButton({ tone: view.chainVisible ? "remote" : "muted", size: "inline" })}
                  onClick={actions.toggleChain}
                  {...labelled(t("controls.chain"))}
                  aria-pressed={view.chainVisible}
                >
                  <Info className="size-3.5" />
                </button>
              ) : null}
            </span>
            <span className={cn(barSubtitle(), view.activeDevice.local ? undefined : "@player:hidden")}>
              {view.track.artist} · {view.track.album}
            </span>
            <span className={barDeviceLine({ remote: !view.activeDevice.local })}>
              <MonitorSpeaker className="size-3.5 shrink-0" />
              {view.activeDevice.name}
            </span>
          </span>
          <FavouriteButton view={view} actions={actions} className="@player:grid hidden" />
          <button
            type="button"
            className={cn(iconButton({ tone: view.moreOpen ? "active" : "muted" }), "@player:hidden")}
            onClick={actions.toggleMore}
            {...labelled(t("controls.more"))}
            aria-expanded={view.moreOpen}
          >
            {view.moreOpen ? <ChevronLeft className="size-4" /> : <ChevronRight className="size-4" />}
          </button>
          <div className={barMoreGroup({ open: view.moreOpen })}>
            <PlayerExtraControls view={view} actions={actions} />
          </div>
        </div>

        <div className={barTransport({ folded: view.moreOpen })}>
          <FavouriteButton view={view} actions={actions} className="@player:hidden" />
          <PlayerTransport view={view} actions={actions} size="bar" />
        </div>

        <div className={barExtras()}>
          <div className={barDesktopExtras()}>
            <PlayerExtraControls view={view} actions={actions} />
          </div>
          <button
            type="button"
            className={cn(iconButton(), "@player:grid hidden")}
            onClick={actions.toggleFullscreen}
            {...labelled(t("controls.fullscreenOpen"))}
            data-player-fullscreen-toggle
          >
            <Maximize className="size-4" />
          </button>
        </div>
      </div>

      <div className={barProgress()}>
        <span className={clock({ align: "right" })}>{formatClock(view.positionSeconds)}</span>
        <PlayerWave view={view} actions={actions} size="bar" />
        <span className={clock()}>{formatClock(view.track.durationSeconds)}</span>
      </div>
    </div>
  );
}
