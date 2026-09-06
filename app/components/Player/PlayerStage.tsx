"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Heart, Mic2, MonitorSpeaker, Minimize } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Dialog, DialogSurface, DialogTitle } from "@components/ui/Dialog";
import { stageFlip as stageFlipVariants, stageFade } from "@utils/animations";

import { PlayerLyrics } from "./PlayerLyrics";
import { PlayerTransport } from "./PlayerTransport";
import { PlayerVolume } from "./PlayerVolume";
import { PlayerWave } from "./PlayerWave";
import { ScrobbleStatus } from "./ScrobbleStatus";
import { TrackCover } from "./TrackCover";
import { FULLSCREEN_TOGGLE_SELECTOR } from "./constants";
import { formatClock, labelled, returnFocusTo, trackInitials } from "./helpers";
import {
  clock,
  iconButton,
  stage,
  stageActions,
  stageAlbum,
  stageArtist,
  stageBackdrop,
  stageChip,
  stageDeviceLine,
  stageChips,
  stageFace,
  stageFlip,
  stageFooter,
  stageHeader,
  stageMain,
  stageMeta,
  stageScrubRow,
  stageTint,
  stageTitle,
  stageTransport,
  stageVolume,
  srOnly,
} from "./styles";
import type { PlayerProps } from "./types";

export function PlayerStage({ view, actions }: PlayerProps) {
  const { t } = useTranslation("player");
  const reduceMotion = useReducedMotion() === true;
  const faceVariants = reduceMotion ? stageFade : stageFlipVariants;

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
        <DialogTitle className={srOnly()}>{view.track.title}</DialogTitle>
        <div className={stageBackdrop()} />
        <div className={stageTint({ tone: view.track.tone })} />

        <div className={stageHeader()}>
          <button
            type="button"
            className={iconButton()}
            onClick={actions.toggleFullscreen}
            {...labelled(t("controls.fullscreenClose"))}
          >
            <Minimize className="size-4" />
          </button>
        </div>

        <div className={stageMain()}>
          <div className={stageFlip()}>
            <AnimatePresence mode="wait" initial={false}>
              {view.lyricsOpen ? (
                <motion.div
                  key="lyrics"
                  className={stageFace()}
                  variants={faceVariants}
                  initial="enterFromRight"
                  animate="settled"
                  exit="leaveToRight"
                >
                  <PlayerLyrics view={view} actions={actions} />
                </motion.div>
              ) : (
                <motion.div
                  key="track"
                  className={stageFace({ layout: "track" })}
                  variants={faceVariants}
                  initial="enterFromLeft"
                  animate="settled"
                  exit="leaveToLeft"
                >
                  <TrackCover
                    initials={trackInitials(view.track.album)}
                    tone={view.track.tone}
                    size="stage"
                    artworkUrl={view.track.artworkUrl}
                  />
                  <div className={stageMeta()}>
                    <h2 className={stageTitle()}>{view.track.title}</h2>
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
                        {...labelled(view.favorite ? t("controls.unfavorite") : t("controls.favorite"))}
                        aria-pressed={view.favorite}
                      >
                        <Heart className={view.favorite ? "size-4 fill-current" : "size-4"} />
                      </button>
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
                        className={iconButton({ tone: view.activeDevice.local ? "muted" : "remote", size: "stage" })}
                        onClick={actions.toggleDevices}
                        {...labelled(t("controls.devices"))}
                        aria-expanded={view.devicesOpen}
                        data-player-devices-toggle
                      >
                        <MonitorSpeaker className="size-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className={stageFooter()}>
          <div className={stageTransport()}>
            <PlayerTransport view={view} actions={actions} size="stage" />
          </div>
          <div className={stageScrubRow()}>
            <span className={clock({ size: "stage", align: "right" })}>{formatClock(view.positionSeconds)}</span>
            <PlayerWave view={view} actions={actions} size="stage" />
            <span className={clock({ size: "stage" })}>{formatClock(view.track.durationSeconds)}</span>
          </div>
          <div className={stageVolume()}>
            <PlayerVolume view={view} actions={actions} size="stage" />
          </div>
        </div>
      </DialogSurface>
    </Dialog>
  );
}
