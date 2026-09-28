"use client";

import type { LibraryTrackItem } from "@hooks/api/queries/library/types";
import { playableOnlyFrom, playerActions, playerTrackFrom } from "@hooks/ui/player";
import { useEntityPlayback } from "@hooks/ui/useEntityPlayback";
import { useCallback } from "react";

export function useLibraryPlayback(
  items: readonly LibraryTrackItem[],
  chosenSources: readonly string[]
): {
  play: (trackId: string) => void;
  enqueue: (trackIds: string[]) => Promise<boolean>;
} {
  const { enqueueEntity } = useEntityPlayback();

  const play = useCallback(
    (trackId: string) => {
      const queue = playableOnlyFrom(items.filter((item) => item.playable).map(playerTrackFrom), chosenSources);
      const startIndex = queue.findIndex((track) => track.id === trackId);
      if (startIndex < 0) return;
      playerActions.playQueue(queue, startIndex);
    },
    [items, chosenSources]
  );

  const enqueue = useCallback((trackIds: string[]) => enqueueEntity({ kind: "tracks", trackIds }), [enqueueEntity]);

  return { play, enqueue };
}
