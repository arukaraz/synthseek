import { keepPreviousData } from "@tanstack/react-query";

import { trpc } from "@utils/trpc";

import type { FollowListInput } from "./types";

export function useFollowList(input: FollowListInput, enabled = true) {
  return trpc.artistFollow.list.useQuery(input, { enabled, placeholderData: keepPreviousData });
}
