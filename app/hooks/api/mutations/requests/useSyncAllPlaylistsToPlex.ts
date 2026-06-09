import i18n from "@locale";
import { errorToast } from "@modules/errors";
import { trpc } from "@utils/trpc";
import { toast } from "sonner";

export function useSyncAllPlaylistsToPlex() {
  const utils = trpc.useUtils();

  return trpc.requests.syncAllPlaylistsToPlex.useMutation({
    onError: (error) => errorToast(error, "requests.syncAllPlexFailed"),
    onSuccess: (data) => {
      if (data.synced > 0) {
        toast.success(i18n.t("mutations:requests.playlistsSyncedPlex", { count: data.synced, failed: data.failed }));
      } else {
        toast.info(i18n.t("mutations:requests.noPlaylistsToSyncPlex"));
      }
    },
    onSettled: () => utils.requests.getAll.invalidate(),
  });
}
