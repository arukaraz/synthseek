import { trpc } from "@utils/trpc";

export function useArtistsForYou() {
  return trpc.analytics.discover.artistsForYou.useQuery(undefined, { trpc: { context: { skipBatch: true } } });
}
