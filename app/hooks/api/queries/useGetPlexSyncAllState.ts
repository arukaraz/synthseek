import { trpc } from "@utils/trpc";

export function useGetPlexSyncAllState() {
  return trpc.requests.getPlexSyncAllState.useQuery(undefined, {
    staleTime: 0,
    refetchOnMount: "always",
  });
}
