import { trpc } from "@utils/trpc";

export function useStations() {
  return trpc.analytics.listening.stations.useQuery();
}
