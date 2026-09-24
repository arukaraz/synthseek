"use client";

import type { PlayerTrack } from "@components/Player";
import { useRadioTracksFetcher } from "@hooks/api";
import type { PlayableTracksTarget } from "@hooks/api/queries/library/types";
import { useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { AUTOPLAY_STATION_SIZE } from "./constants";
import { playerTrackFrom } from "./helpers";
import { actions } from "./store";

export function useStartRadio(): (target: PlayableTracksTarget, seed: PlayerTrack | null) => Promise<void> {
  const { t } = useTranslation("player");
  const fetchRadio = useRadioTracksFetcher();
  const inFlight = useRef(false);

  return useCallback(
    async (target: PlayableTracksTarget, seed: PlayerTrack | null) => {
      if (inFlight.current) return;
      inFlight.current = true;
      try {
        const result = await fetchRadio({ seed: target, excludeTrackIds: [], count: AUTOPLAY_STATION_SIZE });
        const tracks = result.items.map(playerTrackFrom);
        if (tracks.length === 0) {
          toast.info(t("queue.radioEmpty"));
          return;
        }
        actions.playStation(seed, tracks);
      } catch {
        toast.error(t("queue.loadFailed"));
      } finally {
        inFlight.current = false;
      }
    },
    [fetchRadio, t]
  );
}
