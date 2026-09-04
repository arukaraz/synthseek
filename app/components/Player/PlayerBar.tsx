"use client";

import { cn } from "@utils/cn";
import {
  ChevronLeft,
  ChevronRight,
  Heart,
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
  Volume2,
  VolumeX,
} from "lucide-react";
import { useTranslation } from "react-i18next";

import { PlayerExtraControls } from "./PlayerExtraControls";
import { SiriWave } from "./SiriWave";
import { TrackCover } from "./TrackCover";
import { VOLUME_STEP } from "./constants";
import { formatClock, fractionFromPointer, percentOf, trackInitials } from "./helpers";
import {
  bar,
  barDesktopExtras,
  barDeviceLine,
  barExtras,
  barIdentity,
  barIdentityButton,
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
  barVolume,
  clock,
  iconButton,
  playButton,
  progressVars,
  srOnly,
  volumeFill,
  volumeHead,
  volumeRail,
  volumeTrack,
  volumeVars,
} from "./styles";
import type { PlayerProps } from "./types";

export function PlayerBar({ view, actions }: PlayerProps) {
  const { t } = useTranslation("player");
  const progress = percentOf(view.positionSeconds, view.track.durationSeconds);
  const volumePercent = (view.muted ? 0 : view.volume) * 100;

  return (
    <div className={bar()}>
      <div className={barMobileProgress()} style={progressVars(progress)}>
        <div className={barMobileProgressFill()} />
      </div>

      <div className={barIdentity()}>
        <button type="button" className={barIdentityButton()} onClick={actions.toggleFullscreen}>
          <span className={srOnly()}>{t("controls.openTrack")}</span>
          <TrackCover
            initials={trackInitials(view.track.album)}
            tone={view.track.tone}
            size="bar"
            artworkUrl={view.track.artworkUrl}
          />
          <span className="flex min-w-0 flex-col gap-0.5">
            <span className={barTitle()}>{view.track.title}</span>
            <span className={cn(barSubtitle(), view.activeDevice.local ? undefined : "sm:hidden")}>
              {view.track.artist} · {view.track.album}
            </span>
            <span className={barTitleRow()}>
              <span className={barTitleStrong()}>{view.track.title}</span>
              <span className={barTitleArtist()}> · {view.track.artist}</span>
            </span>
            <span className={barDeviceLine({ remote: !view.activeDevice.local })}>
              <MonitorSpeaker className="size-3.5 shrink-0" />
              {view.activeDevice.name}
            </span>
          </span>
        </button>
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

      <div className={barTransport()}>
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

      <div className={barProgress()}>
        <span className={clock({ align: "right" })}>{formatClock(view.positionSeconds)}</span>
        <SiriWave view={view} actions={actions} size="bar" />
        <span className={clock()}>{formatClock(view.track.durationSeconds)}</span>
        <button
          type="button"
          className={iconButton({ tone: view.favorite ? "favorite" : "muted" })}
          onClick={actions.toggleFavorite}
          aria-label={view.favorite ? t("controls.unfavorite") : t("controls.favorite")}
          aria-pressed={view.favorite}
        >
          <Heart className={cn("size-3.5", view.favorite ? "fill-current" : undefined)} />
        </button>
        <button
          type="button"
          className={iconButton({ tone: view.chainVisible ? "remote" : "muted" })}
          onClick={actions.toggleChain}
          aria-label={t("controls.chain")}
          aria-pressed={view.chainVisible}
        >
          <Info className="size-3.5" />
        </button>
      </div>

      <div className={barExtras()}>
        <div className={barVolume()}>
          <button
            type="button"
            className={iconButton()}
            onClick={actions.toggleMute}
            aria-label={view.muted ? t("controls.unmute") : t("controls.mute")}
          >
            {view.muted ? <VolumeX className="size-3.5" /> : <Volume2 className="size-3.5" />}
          </button>
          <div
            role="slider"
            tabIndex={0}
            aria-label={t("controls.volume")}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(volumePercent)}
            aria-valuetext={`${Math.round(volumePercent)}%`}
            className={volumeTrack()}
            style={volumeVars(volumePercent)}
            onPointerDown={(event) => {
              event.currentTarget.setPointerCapture(event.pointerId);
              actions.setVolume(fractionFromPointer(event.clientX, event.currentTarget.getBoundingClientRect()));
            }}
            onPointerMove={(event) => {
              if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
              actions.setVolume(fractionFromPointer(event.clientX, event.currentTarget.getBoundingClientRect()));
            }}
            onPointerUp={(event) => event.currentTarget.releasePointerCapture(event.pointerId)}
            onKeyDown={(event) => {
              const current = view.muted ? 0 : view.volume;
              if (event.key === "ArrowRight" || event.key === "PageUp") {
                event.preventDefault();
                actions.setVolume(current + VOLUME_STEP);
                return;
              }
              if (event.key === "ArrowLeft" || event.key === "PageDown") {
                event.preventDefault();
                actions.setVolume(current - VOLUME_STEP);
                return;
              }
              if (event.key === "Home") {
                event.preventDefault();
                actions.setVolume(0);
                return;
              }
              if (event.key === "End") {
                event.preventDefault();
                actions.setVolume(1);
              }
            }}
          >
            <div className={volumeRail()}>
              <div className={volumeFill()} />
              <div className={volumeHead()} />
            </div>
          </div>
        </div>
        <div className={barDesktopExtras()}>
          <PlayerExtraControls view={view} actions={actions} />
        </div>
        <button
          type="button"
          className={cn(iconButton(), "hidden sm:grid")}
          onClick={actions.toggleFullscreen}
          aria-label={t("controls.fullscreenOpen")}
        >
          <Maximize className="size-4" />
        </button>
      </div>
    </div>
  );
}
