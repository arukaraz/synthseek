import type { FavoriteTracksChange, UserActivityPayload, UserActivitySubject } from "@api/__generated__/types";
import type { QueryClient } from "@tanstack/react-query";
import { getQueryKey } from "@trpc/react-query";
import { trpc } from "@utils/trpc";
import { z } from "zod";

interface TrpcUtils {
  playback: {
    favoriteTrackIds: { invalidate: () => unknown };
    scrobble: { connections: { invalidate: () => unknown } };
  };
}

const FavoriteTrackIdsKeySchema = z.tuple([
  z.unknown(),
  z.object({ input: z.object({ trackIds: z.array(z.string()) }) }),
]);

function writeFavoriteTracks(change: FavoriteTracksChange, queryClient: QueryClient): void {
  const changed = new Set(change.trackIds);
  const cached = queryClient.getQueriesData<string[]>({ queryKey: getQueryKey(trpc.playback.favoriteTrackIds) });
  for (const [key, favorites] of cached) {
    const asked = FavoriteTrackIdsKeySchema.safeParse(key);
    if (!asked.success) {
      void queryClient.invalidateQueries({ queryKey: key, exact: true });
      continue;
    }
    if (favorites === undefined) continue;
    const touched = asked.data[1].input.trackIds.filter((trackId) => changed.has(trackId));
    if (touched.length === 0) continue;
    const kept = favorites.filter((trackId) => !changed.has(trackId));
    queryClient.setQueryData<string[]>(key, change.favorite ? [...kept, ...touched] : kept);
  }
}

type Redraw = (event: UserActivityPayload, utils: TrpcUtils, client: QueryClient) => void;

const REDRAW: Record<UserActivitySubject, Redraw> = {
  favorites: (event, utils, client) => {
    if (event.favoriteTracks === undefined) {
      void utils.playback.favoriteTrackIds.invalidate();
      return;
    }
    writeFavoriteTracks(event.favoriteTracks, client);
  },
  listeningServices: (_event, utils) => {
    void utils.playback.scrobble.connections.invalidate();
  },
};

export function handleUserActivity(event: UserActivityPayload, utils: TrpcUtils, queryClient: QueryClient): void {
  REDRAW[event.subject](event, utils, queryClient);
}
