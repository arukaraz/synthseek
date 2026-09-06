"use client";

import { cn } from "@utils/cn";
import {
  ChevronLeft,
  ChevronRight,
  Info,
  Loader2,
  Maximize,
  MonitorSpeaker,
  Pause,
  Play,
  Repeat,
  Repeat1,
  Shuffle,
  SkipBack,
  SkipForward,
} from "lucide-react";
import { useTranslation } from "react-i18next";

import { FavouriteButton } from "./FavouriteButton";
import { PlayerExtraControls } from "./PlayerExtraControls";
import { PlayerVolume } from "./PlayerVolume";
import { PlayerWave } from "./PlayerWave";
import { TrackCover } from "./TrackCover";
import { formatClock, percentOf, trackInitials } from "./helpers";
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
  playButton,
  progressVars,
} from "./styles";
import type { PlayerProps } from "./types";

export function PlayerBar({ view, actions }: PlayerProps) {
  const { t } = useTranslation("player");
  const progress = percentOf(view.positionSeconds, view.track.durationSeconds);

  return (
    <div className={bar()}>
      <div className={barMobileProgress()} style={progressVars(progress)}>
        <div className={barMobileProgressFill()} />
      </div>

      <div className={barTop()}>
        <div className={barIdentity()}>
          <button
            type="button"
            className={barCoverButton()}
            onClick={actions.toggleFullscreen}
            aria-label={t("controls.openTrack")}
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
              <button
                type="button"
                className={iconButton({ tone: view.chainVisible ? "remote" : "muted", size: "inline" })}
                onClick={actions.toggleChain}
                aria-label={t("controls.chain")}
                aria-pressed={view.chainVisible}
              >
                <Info className="size-3.5" />
              </button>
            </span>
            <span className={cn(barSubtitle(), view.activeDevice.local ? undefined : "sm:hidden")}>
              {view.track.artist} · {view.track.album}
            </span>
            <span className={barDeviceLine({ remote: !view.activeDevice.local })}>
              <MonitorSpeaker className="size-3.5 shrink-0" />
              {view.activeDevice.name}
            </span>
          </span>
          <button
            type="button"
            className={cn(iconButton({ tone: view.moreOpen ? "active" : "muted" }), "sm:hidden")}
            onClick={actions.toggleMore}
            aria-label={t("controls.more")}
            aria-expanded={view.moreOpen}
          >
            {view.moreOpen ? <ChevronLeft className="size-4" /> : <ChevronRight className="size-4" />}
          </button>
          <div className={barMoreGroup({ open: view.moreOpen })}>
            <PlayerExtraControls view={view} actions={actions} />
          </div>
        </div>

        <div className={barTransport({ folded: view.moreOpen })}>
          <FavouriteButton view={view} actions={actions} className="sm:hidden" />
          <button
            type="button"
            className={cn(iconButton({ tone: view.shuffle ? "active" : "muted" }), "hidden sm:grid")}
            onClick={actions.toggleShuffle}
            aria-label={t("controls.shuffle")}
            aria-pressed={view.shuffle}
          >
            <Shuffle className="size-3.5" />
          </button>
          <button
            type="button"
            className={cn(iconButton({ size: "transport" }), "hidden sm:grid")}
            onClick={actions.previous}
            aria-label={t("controls.previous")}
          >
            <SkipBack className="size-4 fill-current" />
          </button>
          <button
            type="button"
            className={playButton({ size: "bar" })}
            onClick={actions.togglePlay}
            aria-label={view.playing ? t("controls.pause") : t("controls.play")}
          >
            {view.loading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : view.playing ? (
              <Pause className="size-3.5 fill-current" />
            ) : (
              <Play className="size-3.5 fill-current" />
            )}
          </button>
          <button
            type="button"
            className={iconButton({ size: "transport" })}
            onClick={actions.next}
            aria-label={t("controls.next")}
          >
            <SkipForward className="size-4 fill-current" />
          </button>
          <button
            type="button"
            className={cn(iconButton({ tone: view.repeat === "off" ? "muted" : "active" }), "hidden sm:grid")}
            onClick={actions.cycleRepeat}
            aria-label={t(`controls.repeat.${view.repeat}`)}
          >
            {view.repeat === "one" ? <Repeat1 className="size-3.5" /> : <Repeat className="size-3.5" />}
          </button>
        </div>

        <div className={barExtras()}>
          <PlayerVolume view={view} actions={actions} size="bar" />
          <div className={barDesktopExtras()}>
            <PlayerExtraControls view={view} actions={actions} />
          </div>
          <button
            type="button"
            className={cn(iconButton(), "hidden sm:grid")}
            onClick={actions.toggleFullscreen}
            aria-label={t("controls.fullscreenOpen")}
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
