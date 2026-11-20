import { usePlaylistSuggestionSeed } from "@hooks/api/queries/playlist-suggestions/usePlaylistSuggestionSeed";
import { errorToast } from "@modules/errors";
import { trpc } from "@utils/trpc";

export function useSetPlaylistSuggestionYears(playlistId: string) {
  const { reseed } = usePlaylistSuggestionSeed(playlistId);

  return trpc.playlists.setSuggestionYears.useMutation({
    onSuccess: () => reseed(),
    onError: (error) => errorToast(error, "playlists.suggestionYearsFailed"),
  });
}
