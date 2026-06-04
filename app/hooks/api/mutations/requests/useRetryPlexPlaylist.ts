import i18n from "@locale";
import { errorToast } from "@modules/errors";
import { trpc } from "@utils/trpc";
import { toast } from "sonner";

export function useRetryPlexPlaylist() {
  return trpc.requests.retryPlexPlaylist.useMutation({
    onError: (error) => errorToast(error, "requests.retryPlexPlaylistFailed"),
    onSuccess: () => toast.success(i18n.t("mutations:requests.playlistSyncedPlex")),
  });
}
