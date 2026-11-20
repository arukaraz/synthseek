import { trpc } from "@utils/trpc";

import { SUGGESTION_BARREN_PAGES, SUGGESTIONS_CACHE_MS } from "./constants";
import { readSuggestionPages } from "./helpers";
import type { UsePlaylistSuggestionsArgs } from "./types";

export function usePlaylistSuggestions({ playlistId, seed, enabled = true }: UsePlaylistSuggestionsArgs) {
  return trpc.playlists.suggestions.useInfiniteQuery(
    { playlistId, seed },
    {
      enabled: enabled && !!playlistId,
      initialCursor: 0,
      getNextPageParam: (_lastPage, pages) => readSuggestionPages(pages, SUGGESTION_BARREN_PAGES).nextCursor,
      staleTime: Infinity,
      gcTime: SUGGESTIONS_CACHE_MS,
      retry: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      trpc: { context: { skipBatch: true } },
    }
  );
}
