"use client";

import { usePlayableTracksFetcher } from "@hooks/api";
import type { PlayableTracksTarget } from "@hooks/api/queries/library/types";
import { playerActions, playerTrackFrom } from "@hooks/ui/player";
import { useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

export function useEntityPlayback(): {
  playEntity: (target: PlayableTracksTarget) => Promise<void>;
  enqueueEntity: (target: PlayableTracksTarget) => Promise<boolean>;
} {
  const { t } = useTranslation("player");
  const fetchPlayable = usePlayableTracksFetcher();
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

  const playEntity = useCallback(
    async (target: PlayableTracksTarget) => {
      const tracks = await resolve(target);
      if (tracks === null) return;
      playerActions.playQueue(tracks, 0);
    },
    [resolve]
  );

  const enqueueEntity = useCallback(
    async (target: PlayableTracksTarget) => {
      const tracks = await resolve(target);
      if (tracks === null) return false;
      const outcome = playerActions.addToQueue(tracks);
      if (outcome.full) toast.info(t("queue.full"));
      else if (outcome.added === 0) toast.info(t("queue.nothingAdded"));
      else toast.success(t("queue.added", { count: outcome.added }));
      return outcome.added > 0;
    },
    [resolve, t]
  );

  return { playEntity, enqueueEntity };
}
