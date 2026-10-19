import { trpc } from "@utils/trpc";

export function useCharts(country: string) {
  return trpc.analytics.discover.charts.useQuery({ country });
}
