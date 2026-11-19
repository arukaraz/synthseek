import { trpc } from "@utils/trpc";

import { FOLLOW_RUN_POLL_MS } from "./constants";

export function useFollowMostPlayedStatus() {
  return trpc.artistFollow.followMostPlayedStatus.useQuery(undefined, {
    staleTime: 0,
    gcTime: 0,
    refetchInterval: (query) => (query.state.data?.running === true ? FOLLOW_RUN_POLL_MS : false),
  });
}
