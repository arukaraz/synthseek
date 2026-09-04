"use client";

import type { LibraryTrackItem } from "@hooks/api/queries/library/types";
import { playerActions, playerTrackFrom } from "@hooks/ui/player";
import { useCallback } from "react";

export function useLibraryPlayback(items: readonly LibraryTrackItem[]): {
  play: (trackId: string) => void;
} {
  const play = useCallback(
    (trackId: string) => {
      const playable = items.filter((item) => item.playable);
      const startIndex = playable.findIndex((item) => item.id === trackId);
      if (startIndex < 0) return;
      playerActions.playQueue(playable.map(playerTrackFrom), startIndex);
    },
    [items]
  );

  return { play };
}
