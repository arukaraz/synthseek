import { trpc } from "@utils/trpc";
import { useCallback } from "react";

import type { RadioTracksInput, RadioTracksResult } from "./types";

export function useRadioTracksFetcher(): (input: RadioTracksInput) => Promise<RadioTracksResult> {
  const utils = trpc.useUtils();
  return useCallback((input: RadioTracksInput) => utils.playback.radioTracks.fetch(input), [utils]);
}
