import { trpc } from "@utils/trpc";

interface UsePlaylistSuggestionsArgs {
  playlistId: string;
  seed: number;
  enabled?: boolean;
}

export function usePlaylistSuggestions({ playlistId, seed, enabled = true }: UsePlaylistSuggestionsArgs) {
  return trpc.playlists.suggestions.useQuery(
    { playlistId, seed },
    {
      enabled: enabled && !!playlistId,
      staleTime: Infinity,
      retry: false,
      placeholderData: (previous) => previous,
      trpc: { context: { skipBatch: true } },
    }
  );
}
