import { trpc } from "@utils/trpc";

import type { ListeningProvider } from "./types";

export function useLovedNotHere(provider: ListeningProvider) {
  return trpc.analytics.discover.loved.useQuery({ provider }, { trpc: { context: { skipBatch: true } } });
}
