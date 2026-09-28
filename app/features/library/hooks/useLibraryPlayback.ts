"use client";

import type { LibraryTrackItem } from "@hooks/api/queries/library/types";
import { playerActions, playerTrackFrom, queueFromSource } from "@hooks/ui/player";
import { useEntityPlayback } from "@hooks/ui/useEntityPlayback";
import { useCallback } from "react";

export function useLibraryPlayback(
  items: readonly LibraryTrackItem[],
  preferredSource: string | null
): {
  play: (trackId: string) => void;
  enqueue: (trackIds: string[]) => Promise<boolean>;
} {
  const { enqueueEntity } = useEntityPlayback();

  const play = useCallback(
    (trackId: string) => {
      const playable = items.filter((item) => item.playable);
      const startIndex = playable.findIndex((item) => item.id === trackId);
      if (startIndex < 0) return;
      const tracks = playable.map(playerTrackFrom);
      const queue =
        preferredSource === null ? tracks : queueFromSource(tracks, { source: preferredSource, fillFromNext: true });
      playerActions.playQueue(queue, startIndex);
    },
    [items, preferredSource]
  );

  const enqueue = useCallback((trackIds: string[]) => enqueueEntity({ kind: "tracks", trackIds }), [enqueueEntity]);

  return { play, enqueue };
}
