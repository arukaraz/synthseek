import i18n from "@locale";
import { errorToast } from "@modules/errors";
import { trpc } from "@utils/trpc";
import { toast } from "sonner";

export function useRetryPlaylist() {
  const utils = trpc.useUtils();

  return trpc.requests.retryPlaylist.useMutation({
    onError: (error) => errorToast(error, "requests.retryPlaylistFailed"),
    onSuccess: () => toast.success(i18n.t("mutations:requests.playlistRetryStarted")),
    onSettled: () => utils.requests.getAll.invalidate(),
  });
}
