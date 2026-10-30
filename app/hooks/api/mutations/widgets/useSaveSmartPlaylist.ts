import { errorToast } from "@modules/errors";
import { trpc } from "@utils/trpc";

export function useSaveSmartPlaylist() {
  const utils = trpc.useUtils();
  return trpc.widgets.savePlaylist.useMutation({
    onSuccess: (saved) => {
      void utils.library.getPlaylists.invalidate();
      void utils.widgets.playlistRule.invalidate({ playlistId: saved.id });
    },
    onError: (error) => errorToast(error, "widgets.savePlaylistFailed"),
  });
}
