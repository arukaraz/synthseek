import { errorToast } from "@modules/errors";
import { trpc } from "@utils/trpc";

export function useReorderPlaylistTracks() {
  const utils = trpc.useUtils();

  return trpc.playlists.reorderTracks.useMutation({
    onError: (error) => errorToast(error, "playlists.reorderFailed"),
    onSettled: () => utils.contentDetail.playlistDetail.invalidate(),
  });
}
