"use client";

import { AnimatePresence, LayoutGroup, MotionConfig, motion } from "framer-motion";
import { Info, ListMusic, Mic2, Minimize, MonitorSpeaker, X } from "lucide-react";
import Image from "next/image";
import { useTranslation } from "react-i18next";

import { motionConfigOf } from "@modules/accessibility";
import { useAccessibility } from "@modules/providers/AccessibilityProvider";
import { artworkImage } from "@utils/artworkProxy";

import { FavouriteButton } from "./FavouriteButton";
import { ListeningAvatars } from "./ListeningAvatars";
import { LyricsAutoScrollSwitch } from "./LyricsAutoScrollSwitch";
import { PlayerLyrics } from "./PlayerLyrics";
import { PlayerMoreMenu } from "./PlayerMoreMenu";
import { PlayerTransport } from "./PlayerTransport";
import { PlayerVolume } from "./PlayerVolume";
import { QueueBody } from "./QueueBody";
import { QueueHeader } from "./QueueHeader";
import { StageChips } from "./StageChips";
import { StageScrub } from "./StageScrub";
import { TrackCover } from "./TrackCover";
import { labelled, stageSide, trackInitials } from "./helpers";
import {
  iconButton,
  immersiveArt,
  immersiveArtImage,
  immersiveColumn,
  immersiveFooterSlide,
  immersiveHeaderDivider,
  immersiveLyrics,
  immersiveMain,
  immersiveMeta,
  immersiveQueue,
  immersiveQueueTitle,
  immersiveVeil,
  stageAlbum,
  stageArtist,
  stageBackdrop,
  stageDeviceLine,
  stageFooter,
  stageHeader,
  stageTint,
  stageTitle,
  stageTransport,
  stageVolume,
} from "./styles";
import type { PlayerProps } from "./types";
import { IDLE_TRANSITION } from "./constants";
import { useStageIdle } from "./useStageIdle";
import { useStagePreferences } from "./useStagePreferences";

export function StageImmersive({ view, actions }: PlayerProps) {
  const { t } = useTranslation("player");
  const { motion: motionChoice } = useAccessibility();
  const { chipsShown, toggleChips, autoScroll, setAutoScroll } = useStagePreferences();
  const side = stageSide(view);
  const beside = side !== null;
  const artworkUrl = view.track.artworkUrl;
  const idle = useStageIdle(
    view.playing && !view.devicesOpen && !view.settingsOpen && !view.modesOpen && !view.listening.roomOpen
  );
  const grow = idle && !beside;

  return (
    <MotionConfig reducedMotion={motionConfigOf(motionChoice)}>
      <div className={stageBackdrop()} />
      {artworkUrl === null ? (
        <div className={stageTint({ tone: view.track.tone })} />
      ) : (
        <div className={immersiveArt()} aria-hidden>
          <Image {...artworkImage(artworkUrl)} alt="" fill sizes="100vw" className={immersiveArtImage()} />
        </div>
      )}
      <div className={immersiveVeil()} />

      <motion.div
        className={stageHeader()}
        data-stage-chrome="header"
        initial={false}
        animate={idle ? { y: "-110%", opacity: 0 } : { y: 0, opacity: 1 }}
        transition={IDLE_TRANSITION}
      >
        {side === "lyrics" && view.lyrics?.synced === true && view.lyrics.lines.length > 0 ? (
          <LyricsAutoScrollSwitch on={autoScroll} onChange={setAutoScroll} />
        ) : null}
        <button
          type="button"
          className={iconButton({ tone: side === "lyrics" ? "active" : "muted", size: "stage" })}
          onClick={actions.toggleLyrics}
          {...labelled(t("controls.lyrics"))}
          aria-pressed={side === "lyrics"}
        >
          <Mic2 className="size-4" />
        </button>
        <button
          type="button"
          className={iconButton({ tone: view.queueOpen ? "active" : "muted", size: "stage" })}
          onClick={actions.toggleQueue}
          {...labelled(t("queue.title"))}
          aria-pressed={view.queueOpen}
          data-player-queue-toggle
        >
          <ListMusic className="size-4" />
        </button>
        <FavouriteButton view={view} actions={actions} size="stage" />
        <button
          type="button"
          className={iconButton({ tone: chipsShown ? "active" : "muted", size: "stage" })}
          onClick={toggleChips}
          {...labelled(chipsShown ? t("stage.chipsHide") : t("stage.chipsShow"))}
          aria-pressed={chipsShown}
        >
          <Info className="size-4" />
        </button>
        <PlayerMoreMenu view={view} actions={actions} layout="stage" />
        <span className={immersiveHeaderDivider()} aria-hidden />
        {view.listening.roomOpen ? null : <ListeningAvatars view={view} actions={actions} placement="stage" />}
        <button
          type="button"
          className={iconButton({ size: "stage" })}
          onClick={actions.toggleFullscreen}
          {...labelled(t("controls.fullscreenClose"))}
        >
          <Minimize className="size-4" />
        </button>
      </motion.div>

      <LayoutGroup>
        <div className={immersiveMain({ idle })} data-stage-idle={idle}>
          <motion.section layout className={immersiveColumn({ lyrics: beside })}>
            <motion.div layout>
              <TrackCover
                initials={trackInitials(view.track.album)}
                tone={view.track.tone}
                size={beside ? "immersiveSide" : grow ? "immersiveIdle" : "immersive"}
                artworkUrl={artworkUrl}
              />
            </motion.div>
            <motion.div layout="position" className={immersiveMeta({ grow })}>
              <h2 className={stageTitle()}>{view.track.title}</h2>
              <p className={stageArtist()}>{view.track.artist}</p>
              <p className={stageAlbum()}>{view.track.album}</p>
              {view.activeDevice.local ? null : (
                <p className={stageDeviceLine()}>
                  <MonitorSpeaker className="size-3.5 shrink-0" />
                  {view.activeDevice.name}
                </p>
              )}
            </motion.div>
            <AnimatePresence initial={false}>
              {chipsShown ? (
                <motion.div
                  key="chips"
                  layout="position"
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                >
                  <StageChips view={view} align="center" />
                </motion.div>
              ) : null}
            </AnimatePresence>
          </motion.section>

          <AnimatePresence initial={false} mode="popLayout">
            {side === "lyrics" ? (
              <motion.section
                key="lyrics"
                className={immersiveLyrics()}
                initial={{ opacity: 0, x: 60 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 60 }}
              >
                <PlayerLyrics view={view} actions={actions} column={{ autoScroll }} />
              </motion.section>
            ) : null}
            {side === "queue" ? (
              <motion.aside
                key="queue"
                className={immersiveQueue()}
                aria-label={t("queue.title")}
                initial={{ opacity: 0, x: 60 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 60 }}
              >
                <QueueHeader
                  view={view}
                  actions={actions}
                  title={<span className={immersiveQueueTitle()}>{t("queue.title")}</span>}
                  closeIcon={<X className="size-4" />}
                />
                <QueueBody view={view} actions={actions} />
              </motion.aside>
            ) : null}
          </AnimatePresence>
        </div>
      </LayoutGroup>

      <motion.div
        className={immersiveFooterSlide()}
        data-stage-chrome="footer"
        initial={false}
        animate={idle ? { height: 0, y: "60%", opacity: 0 } : { height: "auto", y: 0, opacity: 1 }}
        transition={IDLE_TRANSITION}
      >
        <div className={stageFooter({ layout: "wide" })}>
          <div className={stageTransport()}>
            <PlayerTransport view={view} actions={actions} size="stage" joined />
          </div>
          <StageScrub view={view} actions={actions} />
          <div className={stageVolume()}>
            <PlayerVolume view={view} actions={actions} size="stage" />
          </div>
        </div>
      </motion.div>
    </MotionConfig>
  );
}
