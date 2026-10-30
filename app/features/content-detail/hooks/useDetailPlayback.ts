"use client";

import { useCallback } from "react";

import { STAGE_WIDE_QUERY, TOUCH_SHORT_LANDSCAPE_QUERY } from "@components/Player/constants";
import type { PlayableTracksTarget } from "@hooks/api/queries/library/types";
import { playerActions } from "@hooks/ui/player";
import { useEntityPlayback } from "@hooks/ui/useEntityPlayback";
import { useMediaQuery } from "@hooks/ui/useMediaQuery";

import type { DetailPlayback } from "../types";

export function useDetailPlayback(onClose: () => void): DetailPlayback {
  const { playEntity, shuffleEntity, startRadio } = useEntityPlayback();
  const wide = useMediaQuery(STAGE_WIDE_QUERY, true);
  const sideways = useMediaQuery(TOUCH_SHORT_LANDSCAPE_QUERY);

  const leaveFor = useCallback(
    (started: boolean) => {
      if (!started) return;
      onClose();
      if (!wide || sideways) playerActions.openStage();
    },
    [onClose, sideways, wide]
  );

  const play = useCallback(
    async (target: PlayableTracksTarget) => leaveFor(await playEntity(target)),
    [leaveFor, playEntity]
  );
  const shuffle = useCallback(
    async (target: PlayableTracksTarget) => leaveFor(await shuffleEntity(target)),
    [leaveFor, shuffleEntity]
  );
  const radio = useCallback(
    async (target: PlayableTracksTarget) => leaveFor(await startRadio(target)),
    [leaveFor, startRadio]
  );

  return { play, shuffle, radio };
}
