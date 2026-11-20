import i18n from "@locale";
import { errorToast } from "@modules/errors";
import { trpc } from "@utils/trpc";
import { toast } from "sonner";

export function useRemovePlaylistCover() {
  const utils = trpc.useUtils();

  return trpc.playlists.removeCover.useMutation({
    onSuccess: () => toast.success(i18n.t("mutations:playlists.coverRemoved")),
    onError: (error) => errorToast(error, "playlists.coverRemoveFailed"),
    onSettled: () => {
      void utils.contentDetail.playlistDetail.invalidate();
      void utils.library.getPlaylists.invalidate();
      void utils.requests.getAll.invalidate();
    },
  });
}
