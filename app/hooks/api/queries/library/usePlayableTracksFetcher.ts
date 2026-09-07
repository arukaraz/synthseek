import { trpc } from "@utils/trpc";
import { useCallback } from "react";

import type { PlayableTracksTarget } from "./types";

export function usePlayableTracksFetcher() {
  const utils = trpc.useUtils();
  return useCallback((target: PlayableTracksTarget) => utils.library.getPlayableTracks.fetch(target), [utils]);
}
