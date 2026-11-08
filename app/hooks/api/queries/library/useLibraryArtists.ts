import { trpc } from "@utils/trpc";
import { getQueryKey } from "@trpc/react-query";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useCallback, useMemo, useRef } from "react";

import { LIBRARY_BATCH_LIMIT, LIBRARY_BATCH_LIMIT_MAX, LIBRARY_GC_TIME, LIBRARY_STALE_TIME } from "./constants";
import { batchLimitThrough, getNextOffset, loadedCount, stripPaging } from "./helpers";
import type { LibraryArtistsInfiniteResult, LibraryArtistsInput } from "./types";

export function useLibraryArtists(input: LibraryArtistsInput, enabled: boolean): LibraryArtistsInfiniteResult {
  const utils = trpc.useUtils();
  const throughRef = useRef(0);
  const pageSizesRef = useRef(new Map<string, number>());
  const scope = JSON.stringify(stripPaging(input));

  const query = useInfiniteQuery({
    queryKey: getQueryKey(trpc.library.getArtists, stripPaging(input), "infinite"),
    queryFn: async ({ pageParam, signal }) => {
      const sizeKey = `${scope}:${pageParam}`;
      const limit =
        pageSizesRef.current.get(sizeKey) ??
        batchLimitThrough(pageParam, throughRef.current, LIBRARY_BATCH_LIMIT, LIBRARY_BATCH_LIMIT_MAX);
      const page = await utils.library.getArtists.fetch({ ...input, offset: pageParam, limit });
      if (!signal.aborted) pageSizesRef.current.set(sizeKey, limit);
      return page;
    },
    initialPageParam: 0,
    getNextPageParam: getNextOffset,
    enabled,
    staleTime: LIBRARY_STALE_TIME,
    gcTime: LIBRARY_GC_TIME,
  });

  const items = useMemo(() => query.data?.pages.flatMap((page) => page.items), [query.data?.pages]);
  const loaded = loadedCount(query.data?.pages);
  const { hasNextPage, fetchNextPage } = query;

  const loadThrough = useCallback(
    async (offset: number) => {
      let count = loaded;
      let more = hasNextPage;
      throughRef.current = offset;
      try {
        while (more && count <= offset) {
          const next = await fetchNextPage();
          if (next.isError) return;
          count = loadedCount(next.data?.pages);
          more = next.hasNextPage;
        }
      } finally {
        throughRef.current = 0;
      }
    },
    [loaded, hasNextPage, fetchNextPage]
  );

  return {
    items,
    total: query.data?.pages[0]?.total ?? 0,
    facets: query.data?.pages[0]?.facets ?? {},
    letterIndex: query.data?.pages[0]?.letterIndex ?? [],
    loadThrough,
    hasNextPage: query.hasNextPage,
    fetchNextPage: query.fetchNextPage,
    isFetchingNextPage: query.isFetchingNextPage,
    isLoading: query.isLoading,
    isError: query.isError,
  };
}
