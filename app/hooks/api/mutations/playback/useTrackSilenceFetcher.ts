import { trpc } from "@utils/trpc";

import type { TrackSilenceInput, TrackSilenceResult } from "./types";

export function useTrackSilenceFetcher(): (input: TrackSilenceInput) => Promise<TrackSilenceResult> {
  const { mutateAsync } = trpc.playback.trackSilence.useMutation();
  return mutateAsync;
}
