"use client";

import {
  Heart,
  MonitorSpeaker,
  Loader2,
  Minimize,
  Pause,
  Play,
  Repeat,
  Repeat1,
  Shuffle,
  SkipBack,
  SkipForward,
} from "lucide-react";
import { useTranslation } from "react-i18next";

import { Dialog, DialogSurface, DialogTitle } from "@components/ui/Dialog";

import { SiriWave } from "./SiriWave";
import { TrackCover } from "./TrackCover";
import { FULLSCREEN_TOGGLE_SELECTOR } from "./constants";
import { formatClock, returnFocusTo, trackInitials } from "./helpers";
import {
  clock,
  iconButton,
  playButton,
  stage,
  stageActions,
  stageAlbum,
  stageArtist,
  stageBackdrop,
  stageChip,
  stageDeviceLine,
  stageChips,
  stageFooter,
  stageHeader,
  stageMain,
  stageMeta,
  stageScrubRow,
  stageTint,
  stageTitle,
  stageTransport,
} from "./styles";
import type { PlayerProps } from "./types";

export function PlayerStage({ view, actions }: PlayerProps) {
  const { t } = useTranslation("player");

  return (
    <Dialog
      open
      onOpenChange={(next) => {
        if (!next) actions.toggleFullscreen();
      }}
    >
      <DialogSurface
        className={stage()}
        aria-label={t("stage.label")}
        aria-describedby={undefined}
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          returnFocusTo(FULLSCREEN_TOGGLE_SELECTOR);
        }}
      >
        <div className={stageBackdrop()} />
        <div className={stageTint({ tone: view.track.tone })} />

        <div className={stageHeader()}>
          <button
            type="button"
            className={iconButton()}
            onClick={actions.toggleFullscreen}
            aria-label={t("controls.fullscreenClose")}
          >
            <Minimize className="size-4" />
          </button>
        </div>

        <div className={stageMain()}>
          <TrackCover
            initials={trackInitials(view.track.album)}
            tone={view.track.tone}
            size="stage"
            artworkUrl={view.track.artworkUrl}
          />
          <div className={stageMeta()}>
            <DialogTitle className={stageTitle()}>{view.track.title}</DialogTitle>
            <p className={stageArtist()}>{view.track.artist}</p>
            <p className={stageAlbum()}>{view.track.album}</p>
            {view.activeDevice.local ? null : (
              <p className={stageDeviceLine()}>
                <MonitorSpeaker className="size-3.5 shrink-0" />
                {view.activeDevice.name}
              </p>
            )}
            <div className={stageChips()}>
              <span
                className={stageChip({
                  tone: view.chain.transcoding ? "warning" : view.track.lossless ? "lossless" : "muted",
                })}
              >
                {view.chain.fileLabel}
              </span>
              <span className={stageChip({ tone: view.chain.transcoding ? "warning" : "success" })}>
                {t("stage.serverChip", { value: view.chain.serverLabel })}
              </span>
            </div>
            <div className={stageActions()}>
              <button
                type="button"
                className={iconButton({ tone: view.favorite ? "favorite" : "muted", size: "stage" })}
                onClick={actions.toggleFavorite}
                aria-label={view.favorite ? t("controls.unfavorite") : t("controls.favorite")}
                aria-pressed={view.favorite}
              >
                <Heart className={view.favorite ? "size-4 fill-current" : "size-4"} />
              </button>
              <button
                type="button"
                className={iconButton({ tone: view.shuffle ? "active" : "muted", size: "stage" })}
                onClick={actions.toggleShuffle}
                aria-label={t("controls.shuffle")}
                aria-pressed={view.shuffle}
              >
                <Shuffle className="size-4" />
              </button>
              <button
                type="button"
                className={iconButton({ tone: view.repeat === "off" ? "muted" : "active", size: "stage" })}
                onClick={actions.cycleRepeat}
                aria-label={t(`controls.repeat.${view.repeat}`)}
              >
                {view.repeat === "one" ? <Repeat1 className="size-4" /> : <Repeat className="size-4" />}
              </button>
              <button
                type="button"
                className={iconButton({ tone: view.activeDevice.local ? "muted" : "remote", size: "stage" })}
                onClick={actions.toggleDevices}
                aria-label={t("controls.devices")}
                aria-expanded={view.devicesOpen}
                data-player-devices-toggle
              >
                <MonitorSpeaker className="size-4" />
              </button>
            </div>
          </div>
        </div>

        <div className={stageFooter()}>
          <div className={stageScrubRow()}>
            <span className={clock({ size: "stage", align: "right" })}>{formatClock(view.positionSeconds)}</span>
            <SiriWave view={view} actions={actions} size="stage" />
            <span className={clock({ size: "stage" })}>{formatClock(view.track.durationSeconds)}</span>
          </div>
          <div className={stageTransport()}>
            <button
              type="button"
              className={iconButton({ size: "stage" })}
              onClick={actions.previous}
              aria-label={t("controls.previous")}
            >
              <SkipBack className="size-5 fill-current" />
            </button>
            <button
              type="button"
              className={playButton({ size: "stage" })}
              onClick={actions.togglePlay}
              aria-label={view.playing ? t("controls.pause") : t("controls.play")}
            >
              {view.loading ? (
                <Loader2 className="size-5 animate-spin" />
              ) : view.playing ? (
                <Pause className="size-4.5 fill-current" />
              ) : (
                <Play className="size-4.5 fill-current" />
              )}
            </button>
            <button
              type="button"
              className={iconButton({ size: "stage" })}
              onClick={actions.next}
              aria-label={t("controls.next")}
            >
              <SkipForward className="size-5 fill-current" />
            </button>
          </div>
        </div>
      </DialogSurface>
    </Dialog>
  );
}
