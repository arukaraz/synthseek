"use client";

import { AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";

import { DeviceMenu } from "./DeviceMenu";
import { MiniPlayer } from "./MiniPlayer";
import { PlayerBar } from "./PlayerBar";
import { PlayerModeMenu } from "./PlayerModeMenu";
import { PlayerStage } from "./PlayerStage";
import { QueueMenu } from "./QueueMenu";
import { SettingsMenu } from "./SettingsMenu";
import { SignalChain } from "./SignalChain";
import { usePlayerPlacement } from "./useHeaderSlot";
import { headerPlayer, playerDock, playerRoot } from "./styles";
import type { PlayerProps } from "./types";

export function Player({ view, actions }: PlayerProps) {
  const anchorToChain = view.chainVisible && !view.fullscreen;
  const { target, effective } = usePlayerPlacement(view.mode, view.fullscreen);
  const hanging = effective === "compact" && !view.fullscreen;

  return (
    <>
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
        {view.settingsOpen ? (
          <SettingsMenu
            view={view}
            actions={actions}
            chain={anchorToChain}
            anchored={view.fullscreen}
            hanging={hanging}
          />
        ) : null}
        {view.modesOpen ? <PlayerModeMenu view={view} actions={actions} chain={anchorToChain} /> : null}
        {view.queueOpen && !view.fullscreen ? (
          <QueueMenu view={view} actions={actions} chain={anchorToChain} hanging={hanging} />
        ) : null}
      </AnimatePresence>
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
      {view.fullscreen || target !== null ? null : (
        <div className={playerRoot()} data-cy="player">
          <div className={playerDock()}>
            <AnimatePresence>
              {view.chainVisible ? <SignalChain key="chain" view={view} actions={actions} /> : null}
            </AnimatePresence>
            <PlayerBar view={view} actions={actions} />
          </div>
        </div>
      )}
    </>
  );
}
