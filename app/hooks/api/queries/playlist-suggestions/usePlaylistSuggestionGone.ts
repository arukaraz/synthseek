import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";

import { NO_SUGGESTION_IDS, SUGGESTIONS_CACHE_MS } from "./constants";
import { suggestionGoneKey, withGone, withoutGone } from "./helpers";
import type { PlaylistSuggestionsKey } from "./types";

export function usePlaylistSuggestionGone({ playlistId, seed }: PlaylistSuggestionsKey) {
  const client = useQueryClient();
  const queryKey = useMemo(() => suggestionGoneKey({ playlistId, seed }), [playlistId, seed]);
  const { data } = useQuery({
    queryKey,
    queryFn: () => NO_SUGGESTION_IDS,
    initialData: NO_SUGGESTION_IDS,
    staleTime: Infinity,
    gcTime: SUGGESTIONS_CACHE_MS,
  });
  const gone = useMemo(() => new Set(data), [data]);

  const take = useCallback(
    (externalId: string) => {
      client.setQueryData<readonly string[]>(queryKey, (ids) => withGone(ids, externalId));
    },
    [client, queryKey]
  );

  const giveBack = useCallback(
    (externalId: string) => {
      client.setQueryData<readonly string[]>(queryKey, (ids) => withoutGone(ids, externalId));
    },
    [client, queryKey]
  );

  return { gone, take, giveBack };
}
