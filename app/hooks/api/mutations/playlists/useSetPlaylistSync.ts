import i18n from "@locale";
import { errorToast } from "@modules/errors";
import { trpc } from "@utils/trpc";
import { toast } from "sonner";

export function useSetPlaylistSync() {
  const utils = trpc.useUtils();

  return trpc.playlists.setSync.useMutation({
    onSuccess: () => toast.success(i18n.t("mutations:playlists.syncUpdated")),
    onError: (error) => errorToast(error, "playlists.syncUpdatedFailed"),
    onSettled: () => {
      void utils.library.getPlaylists.invalidate();
      void utils.contentDetail.playlistDetail.invalidate();
    },
  });
}
