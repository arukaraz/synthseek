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
  const { enqueueTracks } = useEntityPlayback();

  const queueOf = useCallback(
    (wanted: (item: LibraryTrackItem) => boolean) =>
      playableOnlyFrom(items.filter((item) => item.playable && wanted(item)).map(playerTrackFrom), chosenSources),
    [items, chosenSources]
  );

  const play = useCallback(
    (trackId: string) => {
      const queue = queueOf(() => true);
      const startIndex = queue.findIndex((track) => track.id === trackId);
      if (startIndex < 0) return;
      playerActions.playQueue(queue, startIndex);
    },
    [queueOf]
  );

  const enqueue = useCallback(
    async (trackIds: string[]) => {
      const wanted = new Set(trackIds);
      return enqueueTracks(queueOf((item) => wanted.has(item.id)));
    },
    [queueOf, enqueueTracks]
  );

  return { play, enqueue };
}
