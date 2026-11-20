import type { PlaylistSuggestionsKey } from "@hooks/api/queries/playlist-suggestions/types";
import { usePlaylistSuggestionGone } from "@hooks/api/queries/playlist-suggestions/usePlaylistSuggestionGone";
import { errorToast } from "@modules/errors";
import { trpc } from "@utils/trpc";

export function useHidePlaylistSuggestion(key: PlaylistSuggestionsKey) {
  const { take, giveBack } = usePlaylistSuggestionGone(key);

  return trpc.playlists.hideSuggestion.useMutation({
    onMutate: ({ externalId }) => take(externalId),
    onError: (error, { externalId }) => {
      giveBack(externalId);
      errorToast(error, "playlists.suggestionHideFailed");
    },
  });
}
