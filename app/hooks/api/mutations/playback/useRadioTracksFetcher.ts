import { trpc } from "@utils/trpc";

import type { RadioTracksInput, RadioTracksResult } from "./types";

export function useRadioTracksFetcher(): (input: RadioTracksInput) => Promise<RadioTracksResult> {
  const { mutateAsync } = trpc.playback.radioTracks.useMutation();
  return mutateAsync;
}
