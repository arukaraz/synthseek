import { trpc } from "@utils/trpc";

export function useGetPlaylistSyncAllState() {
  return trpc.requests.getPlaylistSyncAllState.useQuery(undefined, {
    staleTime: 0,
    refetchOnMount: "always",
  });
}
