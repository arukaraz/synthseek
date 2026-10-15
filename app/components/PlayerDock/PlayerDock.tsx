"use client";

import { Player } from "@components/Player";
import { usePlayer, usePlayerSessionSync, usePlayPauseShortcut, useRemoteQueueCommands } from "@hooks/ui/player";

export function PlayerDock() {
  const { view, actions } = usePlayer();
  usePlayerSessionSync();
  useRemoteQueueCommands();
  usePlayPauseShortcut(view === null ? null : actions.togglePlay);

  if (view === null) return null;
  return <Player view={view} actions={actions} />;
}
