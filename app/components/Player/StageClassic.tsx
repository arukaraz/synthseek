"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Minimize, MonitorSpeaker } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { useMotionReduced } from "@hooks/ui/useMotionReduced";
import { stageFlip as stageFlipVariants, stageFade } from "@utils/animations";

import { ListeningAvatars } from "./ListeningAvatars";
import { MiniPlayer } from "./MiniPlayer";
import { PlayerLyrics } from "./PlayerLyrics";
import { PlayerTransport } from "./PlayerTransport";
import { PlayerVolume } from "./PlayerVolume";
import { StageActions } from "./StageActions";
import { StageChips } from "./StageChips";
import { StageController } from "./StageController";
import { StageDrawer } from "./StageDrawer";
import { StageScrub } from "./StageScrub";
import { TrackCover } from "./TrackCover";
import { labelled, trackInitials } from "./helpers";
import {
  iconButton,
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
  stageTint,
  stageTitle,
  stageTransport,
  stageVolume,
} from "./styles";
import type { StageClassicProps, StageDrawerName } from "./types";

export function StageClassic({ view, actions, layout }: StageClassicProps) {
  const { t } = useTranslation("player");
  const reduceMotion = useMotionReduced();
  const faceVariants = reduceMotion ? stageFade : stageFlipVariants;
  const wide = layout === "wide";
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
    <>
      <div className={stageBackdrop()} />
      <div className={stageTint({ tone: view.track.tone })} />

      <div className={stageHeader()}>
        {view.listening.roomOpen ? null : <ListeningAvatars view={view} actions={actions} placement="stage" />}
        <button
          type="button"
          className={iconButton()}
          onClick={actions.toggleFullscreen}
          {...labelled(t("controls.fullscreenClose"))}
        >
          <Minimize className="size-4" />
        </button>
      </div>

      {layout === "landscape" ? (
        <div className={stageMain({ layout })}>
          {view.lyricsOpen ? (
            <div className={stageFace()}>
              <PlayerLyrics view={view} actions={actions} />
            </div>
          ) : (
            <MiniPlayer view={view} actions={actions} placement="stage" />
          )}
        </div>
      ) : (
        <>
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
                <PlayerTransport view={view} actions={actions} size="stage" joined />
              </div>
            ) : null}
            <StageScrub view={view} actions={actions} />
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
        </>
      )}
    </>
  );
}
