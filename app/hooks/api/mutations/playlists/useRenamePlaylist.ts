import i18n from "@locale";
import { errorToast } from "@modules/errors";
import { trpc } from "@utils/trpc";
import { toast } from "sonner";

export function useRenamePlaylist() {
  const utils = trpc.useUtils();

  return trpc.playlists.rename.useMutation({
    onSuccess: () => toast.success(i18n.t("mutations:playlists.renamed")),
    onError: (error) => errorToast(error, "playlists.renameFailed"),
    onSettled: () => {
      void utils.library.getPlaylists.invalidate();
      void utils.contentDetail.playlistDetail.invalidate();
    },
  });
}
