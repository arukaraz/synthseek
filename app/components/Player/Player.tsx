"use client";

import { AnimatePresence } from "framer-motion";

import { DeviceMenu } from "./DeviceMenu";
import { PlayerBar } from "./PlayerBar";
import { PlayerStage } from "./PlayerStage";
import { SignalChain } from "./SignalChain";
import { playerDock, playerRoot } from "./styles";
import type { PlayerProps } from "./types";

export function Player({ view, actions }: PlayerProps) {
  const anchorToChain = view.chainVisible && !view.fullscreen;

  return (
    <>
      {view.fullscreen ? <PlayerStage view={view} actions={actions} /> : null}
      <AnimatePresence>
        {view.devicesOpen ? <DeviceMenu view={view} actions={actions} chain={anchorToChain} /> : null}
      </AnimatePresence>
      {view.fullscreen ? null : (
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
