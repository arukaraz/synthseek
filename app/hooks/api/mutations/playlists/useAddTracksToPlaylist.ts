import i18n from "@locale";
import { errorToast } from "@modules/errors";
import { trpc } from "@utils/trpc";
import { toast } from "sonner";

export function useAddTracksToPlaylist() {
  const utils = trpc.useUtils();

  return trpc.playlists.addTracks.useMutation({
    onSuccess: () => toast.success(i18n.t("mutations:playlists.tracksAdded")),
    onError: (error) => errorToast(error, "playlists.tracksAddedFailed"),
    onSettled: () => {
      void utils.library.getPlaylists.invalidate();
      void utils.library.getTracks.invalidate();
      void utils.contentDetail.playlistDetail.invalidate();
    },
  });
}
