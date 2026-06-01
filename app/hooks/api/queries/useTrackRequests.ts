import { trpc } from "@utils/trpc";

export function useTrackRequests() {
  return trpc.requests.getAll.useQuery(undefined, {
    staleTime: 2000,
    refetchOnMount: "always",
  });
}
