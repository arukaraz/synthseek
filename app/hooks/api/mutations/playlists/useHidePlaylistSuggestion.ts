import { errorToast } from "@modules/errors";
import { trpc } from "@utils/trpc";

export function useHidePlaylistSuggestion() {
  const utils = trpc.useUtils();

  return trpc.playlists.hideSuggestion.useMutation({
    onError: (error) => errorToast(error, "playlists.suggestionHideFailed"),
    onSettled: (_data, _error, { playlistId }) => utils.playlists.suggestions.invalidate({ playlistId }),
  });
}
