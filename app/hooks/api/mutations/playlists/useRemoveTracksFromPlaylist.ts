import i18n from "@locale";
import { errorToast } from "@modules/errors";
import { trpc } from "@utils/trpc";
import { toast } from "sonner";

export function useRemoveTracksFromPlaylist() {
  const utils = trpc.useUtils();

  return trpc.playlists.removeTracks.useMutation({
    onSuccess: () => toast.success(i18n.t("mutations:playlists.tracksRemoved")),
    onError: (error) => errorToast(error, "playlists.tracksRemovedFailed"),
    onSettled: () => {
      void utils.library.getPlaylists.invalidate();
      void utils.library.getTracks.invalidate();
      void utils.contentDetail.playlistDetail.invalidate();
    },
  });
}
