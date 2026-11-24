import { trpc } from "@utils/trpc";

import type { ListeningProvider } from "./types";

export function useProviderTopArtists(provider: ListeningProvider) {
  return trpc.analytics.discover.topArtists.useQuery({ provider }, { trpc: { context: { skipBatch: true } } });
}
