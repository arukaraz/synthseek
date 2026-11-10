import { trpc } from "@utils/trpc";

export function useCharts() {
  return trpc.analytics.discover.charts.useQuery(undefined, { trpc: { context: { skipBatch: true } } });
}
