"use client";

import { AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";

import { useTrackAnnouncement } from "@hooks/ui/player/useTrackAnnouncement";
import { useAccessibility } from "@modules/providers/AccessibilityProvider";

import { DeviceMenu } from "./DeviceMenu";
import { ListeningAvatars } from "./ListeningAvatars";
import { ListeningArrival } from "./ListeningArrival";
import { ListeningRoom } from "./ListeningRoom";
import { HeaderProgress } from "./HeaderProgress";
import { panelOpen } from "./helpers";
import { MiniPlayer } from "./MiniPlayer";
import { PlaybackProblem } from "./PlaybackProblem";
import { PlayerBar } from "./PlayerBar";
import { PlayerMasthead } from "./PlayerMasthead";
import { PlayerModeMenu } from "./PlayerModeMenu";
import { PlayerStage } from "./PlayerStage";
import { QueueMenu } from "./QueueMenu";
import { SettingsMenu } from "./SettingsMenu";
import { SettingsModal } from "./SettingsModal";
import { SignalChain } from "./SignalChain";
import { usePlayerPlacement } from "./useHeaderSlot";
import { headerPlayer, playerDock, playerRoot } from "./styles";
import type { PlayerProps } from "./types";

export function Player({ view, actions }: PlayerProps) {
  const { t } = useTranslation("player");
  const anchorToChain = view.chainVisible && !view.fullscreen;
  const { target, masthead, progress, effective } = usePlayerPlacement(view.mode, view.fullscreen);
  const hanging = effective === "compact" && !view.fullscreen;
  const docked = target === null && masthead === null;
  const { mode: accessibilityMode } = useAccessibility();
  const dockedProblem = view.failing && docked && !view.fullscreen;
  useTrackAnnouncement({
    id: view.track.id,
    title: view.track.title,
    artist: view.track.artist,
    playing: view.playing,
  });

  return (
    <>
      {view.failing && !dockedProblem ? <PlaybackProblem visible={false} /> : null}
      {view.fullscreen ? <PlayerStage view={view} actions={actions} /> : null}
      <AnimatePresence>
        {view.chainVisible && hanging ? (
          <SignalChain key="chain" view={view} actions={actions} placement="header" />
        ) : null}
        {view.devicesOpen ? (
          <DeviceMenu
            view={view}
            actions={actions}
            chain={anchorToChain}
            anchored={view.fullscreen}
            hanging={hanging}
          />
        ) : null}
        {view.settingsOpen && view.fullscreen ? <SettingsModal view={view} actions={actions} /> : null}
        {view.settingsOpen && !view.fullscreen ? (
          <SettingsMenu view={view} actions={actions} chain={anchorToChain} hanging={hanging} />
        ) : null}
        {view.modesOpen ? <PlayerModeMenu view={view} actions={actions} chain={anchorToChain} /> : null}
        {view.queueOpen && !view.fullscreen ? (
          <QueueMenu view={view} actions={actions} chain={anchorToChain} hanging={hanging} />
        ) : null}
        {view.listening.roomOpen ? (
          <ListeningRoom
            view={view}
            actions={actions}
            chain={anchorToChain}
            anchored={view.fullscreen}
            hanging={hanging}
          />
        ) : null}
      </AnimatePresence>
      <ListeningArrival view={view} actions={actions} />
      {target !== null
        ? createPortal(
            effective === "mini" ? (
              <MiniPlayer view={view} actions={actions} />
            ) : (
              <div className={headerPlayer()}>
                <PlayerBar view={view} actions={actions} placement="header" />
              </div>
            ),
            target
          )
        : null}
      {masthead !== null ? createPortal(<PlayerMasthead view={view} actions={actions} />, masthead) : null}
      {progress !== null ? createPortal(<HeaderProgress view={view} />, progress) : null}
      {view.fullscreen || !docked ? null : (
        <div className={playerRoot()} data-cy="player" role="region" aria-label={t("controls.region")}>
          <div className={playerDock()}>
            <AnimatePresence>
              {view.chainVisible ? <SignalChain key="chain" view={view} actions={actions} /> : null}
            </AnimatePresence>
            {dockedProblem ? <PlaybackProblem visible={accessibilityMode} /> : null}
            <PlayerBar view={view} actions={actions} />
          </div>
          {panelOpen(view) ? null : <ListeningAvatars view={view} actions={actions} placement="dock" />}
        </div>
      )}
    </>
  );
}
