import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";

import { SUGGESTIONS_CACHE_MS, SUGGESTION_SEED_KEY } from "./constants";
import { newSuggestionSeed } from "./helpers";

export function usePlaylistSuggestionSeed(playlistId: string) {
  const client = useQueryClient();
  const queryKey = useMemo(() => [SUGGESTION_SEED_KEY, playlistId], [playlistId]);
  const { data: seed } = useQuery({
    queryKey,
    queryFn: () => newSuggestionSeed(),
    initialData: () => newSuggestionSeed(),
    staleTime: Infinity,
    gcTime: SUGGESTIONS_CACHE_MS,
  });

  const reseed = useCallback(() => {
    client.setQueryData(queryKey, newSuggestionSeed());
  }, [client, queryKey]);

  return { seed, reseed };
}
