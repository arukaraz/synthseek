import { trpc } from "@utils/trpc";
import { getQueryKey } from "@trpc/react-query";
import { keepPreviousData, useInfiniteQuery } from "@tanstack/react-query";

import { LIBRARY_BATCH_LIMIT, LIBRARY_GC_TIME, LIBRARY_STALE_TIME } from "./constants";
import { getNextOffset } from "./helpers";
import type { LibraryTracksInfiniteResult, LibraryTracksQuery } from "./types";

const NO_SOURCES: string[] = [];

export function useLibraryTracks(input: LibraryTracksQuery, enabled: boolean): LibraryTracksInfiniteResult {
  const utils = trpc.useUtils();

  const query = useInfiniteQuery({
    queryKey: getQueryKey(trpc.library.getTracks, input, "infinite"),
    queryFn: ({ pageParam }) =>
      utils.library.getTracks.fetch({ ...input, offset: pageParam, limit: LIBRARY_BATCH_LIMIT }),
    initialPageParam: 0,
    getNextPageParam: getNextOffset,
    enabled,
    placeholderData: keepPreviousData,
    staleTime: LIBRARY_STALE_TIME,
    gcTime: LIBRARY_GC_TIME,
  });

  const firstPage = query.data?.pages[0];

  return {
    items: query.data?.pages.flatMap((page) => page.items),
    total: firstPage?.total ?? 0,
    facets: firstPage?.facets ?? {},
    appliedSources: firstPage?.appliedSources ?? NO_SOURCES,
    hasNextPage: query.hasNextPage,
    fetchNextPage: query.fetchNextPage,
    isFetchingNextPage: query.isFetchingNextPage,
    isLoading: query.isLoading,
    isError: query.isError,
    isRefreshing: query.isPlaceholderData,
  };
}
