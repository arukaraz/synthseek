import { trpc } from "@utils/trpc";

import type { ListeningProvider } from "./types";

export function useListenedTracks(provider: ListeningProvider) {
  return trpc.analytics.discover.listenedTracks.useQuery(
    { provider },
    { staleTime: 60_000, trpc: { context: { skipBatch: true } } }
  );
}
