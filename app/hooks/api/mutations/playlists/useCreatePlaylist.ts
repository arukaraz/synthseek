import i18n from "@locale";
import { errorToast } from "@modules/errors";
import { trpc } from "@utils/trpc";
import { toast } from "sonner";

export function useCreatePlaylist() {
  const utils = trpc.useUtils();

  return trpc.playlists.createLocal.useMutation({
    onSuccess: () => toast.success(i18n.t("mutations:playlists.created")),
    onError: (error) => errorToast(error, "playlists.createFailed"),
    onSettled: () => {
      void utils.library.getPlaylists.invalidate();
      void utils.library.getTracks.invalidate();
    },
  });
}
