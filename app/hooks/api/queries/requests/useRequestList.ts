import { useInfiniteQuery } from "@tanstack/react-query";
import { getQueryKey } from "@trpc/react-query";
import { trpc } from "@utils/trpc";

import {
  REQUEST_LIST_FIRST_PAGE,
  REQUEST_LIST_MAX_PAGES,
  REQUEST_LIST_PAGE_SIZE,
  REQUEST_LIST_STALE_TIME,
} from "./constants";
import { nextRequestListCursor, previousRequestListCursor, uniqueRequestListItems } from "./helpers";
import type { RequestListInput, RequestListResult } from "./types";

export function useRequestList(input: RequestListInput, enabled: boolean = true): RequestListResult {
  const utils = trpc.useUtils();

  const query = useInfiniteQuery({
    queryKey: getQueryKey(trpc.requests.list, input, "infinite"),
    queryFn: ({ pageParam }) =>
      utils.client.requests.list.query({ ...input, cursor: pageParam, limit: REQUEST_LIST_PAGE_SIZE }),
    initialPageParam: REQUEST_LIST_FIRST_PAGE,
    getNextPageParam: nextRequestListCursor,
    getPreviousPageParam: previousRequestListCursor,
    maxPages: REQUEST_LIST_MAX_PAGES,
    enabled,
    staleTime: REQUEST_LIST_STALE_TIME,
    refetchOnMount: "always",
  });

  return {
    items: uniqueRequestListItems(query.data?.pages ?? []),
    total: query.data?.pages[0]?.total ?? 0,
    isLoading: query.isLoading,
    hasNextPage: query.hasNextPage,
    isFetchingNextPage: query.isFetchingNextPage,
    fetchNextPage: () => void query.fetchNextPage(),
    hasPreviousPage: query.hasPreviousPage,
    isFetchingPreviousPage: query.isFetchingPreviousPage,
    fetchPreviousPage: () => void query.fetchPreviousPage(),
  };
}
