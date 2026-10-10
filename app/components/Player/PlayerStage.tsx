"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Minimize, MonitorSpeaker } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { Dialog, DialogSurface, DialogTitle } from "@components/ui/Dialog";
import { useMediaQuery } from "@hooks/ui/useMediaQuery";
import { stageFlip as stageFlipVariants, stageFade } from "@utils/animations";

import { PlayerLyrics } from "./PlayerLyrics";
import { PlayerTransport } from "./PlayerTransport";
import { PlayerVolume } from "./PlayerVolume";
import { PlayerWave } from "./PlayerWave";
import { StageActions } from "./StageActions";
import { StageChips } from "./StageChips";
import { StageController } from "./StageController";
import { StageDrawer } from "./StageDrawer";
import { TrackCover } from "./TrackCover";
import { FULLSCREEN_TOGGLE_SELECTOR, STAGE_WIDE_QUERY } from "./constants";
import { formatClock, labelled, returnFocusTo, trackInitials } from "./helpers";
import {
  clock,
  iconButton,
  stage,
  stageActions,
  stageAlbum,
  stageArtist,
  stageBackdrop,
  stageCoverSlot,
  stageDeviceLine,
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
import type { PlayerProps, StageDrawerName } from "./types";

export function PlayerStage({ view, actions }: PlayerProps) {
  const { t } = useTranslation("player");
  const reduceMotion = useReducedMotion() === true;
  const faceVariants = reduceMotion ? stageFade : stageFlipVariants;
  const wide = useMediaQuery(STAGE_WIDE_QUERY);
  const layout = wide ? "wide" : "compact";
  const [drawer, setDrawer] = useState<StageDrawerName | null>(null);
  const cover = (
    <TrackCover
      initials={trackInitials(view.track.album)}
      tone={view.track.tone}
      size={wide ? "stage" : "fluid"}
      artworkUrl={view.track.artworkUrl}
    />
  );

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

        <div className={stageMain({ layout })}>
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
                  className={stageFace({ layout: wide ? "track" : "compact" })}
                  variants={faceVariants}
                  initial="enterFromLeft"
                  animate="settled"
                  exit="leaveToLeft"
                >
                  {wide ? cover : <div className={stageCoverSlot()}>{cover}</div>}
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
                    {wide ? (
                      <>
                        <StageChips view={view} />
                        <div className={stageActions()}>
                          <StageActions view={view} actions={actions} />
                        </div>
                      </>
                    ) : null}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          {wide ? null : (
            <StageDrawer open={drawer === "info"}>
              <StageChips view={view} />
            </StageDrawer>
          )}
        </div>

        <div className={stageFooter({ layout })}>
          {wide ? (
            <div className={stageTransport()}>
              <PlayerTransport view={view} actions={actions} size="stage" />
            </div>
          ) : null}
          <div className={stageScrubRow()}>
            <span className={clock({ size: "stage", align: "right" })}>{formatClock(view.positionSeconds)}</span>
            <PlayerWave view={view} actions={actions} size="stage" />
            <span className={clock({ size: "stage" })}>{formatClock(view.track.durationSeconds)}</span>
          </div>
          {wide ? (
            <div className={stageVolume()}>
              <PlayerVolume view={view} actions={actions} size="stage" />
            </div>
          ) : (
            <StageController
              view={view}
              actions={actions}
              drawer={drawer}
              onToggle={(next) => setDrawer((current) => (current === next ? null : next))}
            />
          )}
        </div>
      </DialogSurface>
    </Dialog>
  );
}
