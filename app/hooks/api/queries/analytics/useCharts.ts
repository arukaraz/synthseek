import { trpc } from "@utils/trpc";

import type { ListeningProvider } from "./types";

export function useCharts(provider: ListeningProvider) {
  return trpc.analytics.discover.charts.useQuery({ provider }, { trpc: { context: { skipBatch: true } } });
}
