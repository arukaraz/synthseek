import type { FavoriteTracksChange, UserActivityPayload, UserActivitySubject } from "@api/__generated__/types";
import type { QueryClient } from "@tanstack/react-query";
import { getQueryKey } from "@trpc/react-query";
import { trpc } from "@utils/trpc";
import { z } from "zod";

type TrpcUtils = ReturnType<typeof trpc.useUtils>;

const FavoriteTrackIdsKeySchema = z.tuple([
  z.unknown(),
  z.object({ input: z.object({ trackIds: z.array(z.string()) }) }),
]);

function writeFavoriteTracks(change: FavoriteTracksChange, queryClient: QueryClient): void {
  const changed = new Set(change.trackIds);
  const cached = queryClient.getQueriesData<string[]>({ queryKey: getQueryKey(trpc.playback.favoriteTrackIds) });
  for (const [key, favorites] of cached) {
    const asked = FavoriteTrackIdsKeySchema.safeParse(key);
    if (favorites === undefined || !asked.success) continue;
    const touched = asked.data[1].input.trackIds.filter((trackId) => changed.has(trackId));
    if (touched.length === 0) continue;
    const kept = favorites.filter((trackId) => !changed.has(trackId));
    queryClient.setQueryData<string[]>(key, change.favorite ? [...kept, ...touched] : kept);
  }
}

type Redraw = (event: UserActivityPayload, utils: TrpcUtils, client: QueryClient, viewerKnown: boolean) => void;

const REDRAW: Record<UserActivitySubject, Redraw> = {
  favorites: (event, utils, client, viewerKnown) => {
    if (event.favoriteTracks === undefined || !viewerKnown) {
      void utils.playback.favoriteTrackIds.invalidate();
      return;
    }
    writeFavoriteTracks(event.favoriteTracks, client);
  },
  listeningServices: (_event, utils) => {
    void utils.playback.scrobble.connections.invalidate();
  },
};

export function handleUserActivity(
  event: UserActivityPayload,
  utils: TrpcUtils,
  queryClient: QueryClient,
  viewerId: string | null
): void {
  if (viewerId !== null && event.userId !== viewerId) return;
  REDRAW[event.subject](event, utils, queryClient, viewerId !== null);
}
