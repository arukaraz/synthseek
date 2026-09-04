"use client";

import { Player } from "@components/Player";
import { usePlayer } from "@hooks/ui/player";

export function PlayerDock() {
  const { view, actions } = usePlayer();

  if (view === null) return null;
  return <Player view={view} actions={actions} />;
}
