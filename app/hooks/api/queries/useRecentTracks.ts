import { trpc } from "@utils/trpc";

export function useRecentTracks(limit: number) {
  return trpc.requests.getRecentTracks.useQuery({ limit }, { staleTime: 2000, refetchOnMount: "always" });
}
