import i18n from "@locale";
import { errorToast } from "@modules/errors";
import { trpc } from "@utils/trpc";
import { toast } from "sonner";

export function useDeletePlaylist() {
  const utils = trpc.useUtils();

  return trpc.requests.deletePlaylist.useMutation({
    onSuccess: () => toast.success(i18n.t("mutations:playlists.deleted")),
    onError: (error) => errorToast(error, "playlists.deleteFailed"),
    onSettled: () => {
      void utils.library.getPlaylists.invalidate();
      void utils.requests.getAll.invalidate();
    },
  });
}
