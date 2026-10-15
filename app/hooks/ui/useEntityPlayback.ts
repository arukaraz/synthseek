"use client";

import type { PlayerTrack } from "@components/Player";
import { usePlayableTracksFetcher } from "@hooks/api";
import type { PlayableTracksTarget } from "@hooks/api/queries/library/types";
import { playerActions, playerTrackFrom, tracksFromChosenSource, useStartRadio } from "@hooks/ui/player";
import { useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

export function useEntityPlayback(): {
  playEntity: (target: PlayableTracksTarget) => Promise<void>;
  shuffleEntity: (target: PlayableTracksTarget) => Promise<void>;
  enqueueEntity: (target: PlayableTracksTarget) => Promise<boolean>;
  enqueueEntities: (targets: readonly PlayableTracksTarget[]) => Promise<boolean>;
  enqueueTracks: (tracks: readonly PlayerTrack[]) => boolean;
  startRadio: (target: PlayableTracksTarget) => Promise<void>;
} {
  const { t } = useTranslation("player");
  const fetchPlayable = usePlayableTracksFetcher();
  const startStation = useStartRadio();
  const inFlightRef = useRef(new Set<string>());

  const resolve = useCallback(
    async (target: PlayableTracksTarget) => {
      const key = JSON.stringify(target);
      if (inFlightRef.current.has(key)) return null;
      inFlightRef.current.add(key);
      try {
        const result = await fetchPlayable(target);
        if (result.items.length === 0) {
          toast.info(t("queue.nothingPlayable"));
          return null;
        }
        if (result.truncated) toast.info(t("queue.truncated", { count: result.items.length }));
        return result.items.map(playerTrackFrom);
      } catch {
        toast.error(t("queue.loadFailed"));
        return null;
      } finally {
        inFlightRef.current.delete(key);
      }
    },
    [fetchPlayable, t]
  );

  const queueFor = useCallback(
    async (target: PlayableTracksTarget) => {
      const tracks = await resolve(target);
      if (tracks === null) return null;
      return target.kind === "album" || target.kind === "artist" ? tracksFromChosenSource(tracks) : tracks;
    },
    [resolve]
  );

  const playEntity = useCallback(
    async (target: PlayableTracksTarget) => {
      const queue = await queueFor(target);
      if (queue !== null) playerActions.playQueue(queue, 0);
    },
    [queueFor]
  );

  const shuffleEntity = useCallback(
    async (target: PlayableTracksTarget) => {
      const queue = await queueFor(target);
      if (queue !== null) playerActions.playShuffled(queue);
    },
    [queueFor]
  );

  const enqueueTracks = useCallback(
    (tracks: readonly PlayerTrack[]) => {
      if (tracks.length === 0) {
        toast.info(t("queue.nothingPlayable"));
        return false;
      }
      const outcome = playerActions.addToQueue(tracks);
      if (outcome.full) toast.info(t("queue.full"));
      else if (outcome.added === 0) toast.info(t("queue.nothingAdded"));
      else toast.success(t("queue.added", { count: outcome.added }));
      return outcome.added > 0;
    },
    [t]
  );

  const enqueueEntity = useCallback(
    async (target: PlayableTracksTarget) => {
      const tracks = await resolve(target);
      if (tracks === null) return false;
      return enqueueTracks(tracks);
    },
    [resolve, enqueueTracks]
  );

  const enqueueEntities = useCallback(
    async (targets: readonly PlayableTracksTarget[]) => {
      const tracks: PlayerTrack[] = [];
      let truncated = false;
      try {
        for (const target of targets) {
          const result = await fetchPlayable(target);
          truncated = truncated || result.truncated;
          tracks.push(...result.items.map(playerTrackFrom));
        }
      } catch {
        toast.error(t("queue.loadFailed"));
        return false;
      }
      if (truncated) toast.info(t("queue.truncated", { count: tracks.length }));
      return enqueueTracks(tracks);
    },
    [fetchPlayable, enqueueTracks, t]
  );

  const startRadio = useCallback((target: PlayableTracksTarget) => startStation(target, null), [startStation]);

  return { playEntity, shuffleEntity, enqueueEntity, enqueueEntities, enqueueTracks, startRadio };
}
