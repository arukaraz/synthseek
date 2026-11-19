import { trpc } from "@utils/trpc";

import { FOLLOW_RUN_POLL_MS } from "./constants";

export function useFollowMostPlayedStatus(enabled: boolean) {
  return trpc.artistFollow.followMostPlayedStatus.useQuery(undefined, {
    enabled,
    staleTime: 0,
    gcTime: 0,
    refetchInterval: (query) => (query.state.data?.running === false ? false : FOLLOW_RUN_POLL_MS),
  });
}
