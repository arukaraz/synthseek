import { trpc } from "@utils/trpc";

export function useCoverArtCount() {
  return trpc.maintenance.coverArtCount.useQuery(undefined, {
    refetchInterval: (query) => (query.state.data?.counting ? 1000 : false),
  });
}

export function useCoverArtFillStatus() {
  return trpc.maintenance.coverArtFillStatus.useQuery(undefined, {
    refetchInterval: (query) => (query.state.data?.running ? 1000 : false),
  });
}
