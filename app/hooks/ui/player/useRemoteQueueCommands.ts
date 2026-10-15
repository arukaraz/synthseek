"use client";

import type { PlayerTrack } from "@components/Player";
import { usePlayableTracksFetcher } from "@hooks/api";
import { useEffect } from "react";

import { setQueueCommandHandler } from "./commands";
import { playerTrackFrom } from "./helpers";
import { actions } from "./store";

export function useRemoteQueueCommands(): void {
  const fetchPlayable = usePlayableTracksFetcher();

  useEffect(() => {
    const tracksFor = async (trackIds: string[]): Promise<PlayerTrack[]> => {
      if (trackIds.length === 0) return [];
      const result = await fetchPlayable({ kind: "tracks", trackIds });
      return result.items.map(playerTrackFrom);
    };

    setQueueCommandHandler((command) => {
      switch (command.command) {
        case "queueRemove":
          for (const trackId of command.trackIds) actions.removeTrackFromQueue(trackId);
          return;
        case "queueClear":
          actions.clearQueue();
          return;
        case "queueMove":
          actions.moveUpcoming(command.trackId, command.toPosition);
          return;
        case "queueAdd":
          void tracksFor(command.trackIds)
            .then((tracks) => {
              if (command.placement === "next") actions.playNext(tracks);
              else actions.addToQueue(tracks);
            })
            .catch(() => undefined);
          return;
        case "queuePlay":
          void tracksFor(command.trackIds)
            .then((tracks) => {
              if (tracks.length === 0) return;
              if (command.shuffle) actions.playShuffled(tracks);
              else actions.playQueue(tracks, Math.min(command.startIndex, tracks.length - 1));
            })
            .catch(() => undefined);
          return;
      }
    });
    return () => setQueueCommandHandler(null);
  }, [fetchPlayable]);
}
