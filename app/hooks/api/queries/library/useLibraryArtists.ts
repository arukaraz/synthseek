import { trpc } from "@utils/trpc";
import { getQueryKey } from "@trpc/react-query";
import { useInfiniteQuery } from "@tanstack/react-query";

import { LIBRARY_BATCH_LIMIT, LIBRARY_GC_TIME, LIBRARY_STALE_TIME } from "./constants";
import { getNextOffset, stripPaging } from "./helpers";
import type { LibraryArtistItem, LibraryArtistsInput, LibraryInfiniteResult } from "./types";

export function useLibraryArtists(
  input: LibraryArtistsInput,
  enabled: boolean
): LibraryInfiniteResult<LibraryArtistItem> {
  const utils = trpc.useUtils();

  const query = useInfiniteQuery({
    queryKey: getQueryKey(trpc.library.getArtists, stripPaging(input), "infinite"),
    queryFn: ({ pageParam }) =>
      utils.library.getArtists.fetch({ ...input, offset: pageParam, limit: LIBRARY_BATCH_LIMIT }),
    initialPageParam: 0,
    getNextPageParam: getNextOffset,
    enabled,
    staleTime: LIBRARY_STALE_TIME,
    gcTime: LIBRARY_GC_TIME,
  });

  return {
    items: query.data?.pages.flatMap((page) => page.items),
    total: query.data?.pages[0]?.total ?? 0,
    facets: query.data?.pages[0]?.facets ?? {},
    hasNextPage: query.hasNextPage,
    fetchNextPage: query.fetchNextPage,
    isFetchingNextPage: query.isFetchingNextPage,
    isLoading: query.isLoading,
    isError: query.isError,
  };
}
