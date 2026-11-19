import { trpc } from "@utils/trpc";

import { FOLLOW_FIRST_PAGE } from "./constants";

export function useFollowedTotal(): number | undefined {
  return trpc.artistFollow.list.useQuery(FOLLOW_FIRST_PAGE).data?.total;
}
