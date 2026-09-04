import { trpc } from "@utils/trpc";

import { FAVORITE_STALE_TIME } from "./constants";

export function useFavoriteTracks(trackIds: string[]) {
  return trpc.playback.favoriteTrackIds.useQuery(
    { trackIds },
    { enabled: trackIds.length > 0, staleTime: FAVORITE_STALE_TIME }
  );
}
