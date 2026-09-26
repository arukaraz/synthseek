import { toast } from "sonner";

import i18n from "@locale";
import { errorToast } from "@modules/errors";
import { trpc } from "@utils/trpc";

export function useSyncPlaylistFromSource() {
  const utils = trpc.useUtils();
  return trpc.librarySource.provider.syncPlaylistNow.useMutation({
    onSuccess: (result) => {
      if (result.status === "synced") {
        toast.success(i18n.t("mutations:librarySource.playlistSyncQueued"));
        utils.requests.invalidate();
      } else if (result.status === "no_change") {
        toast.info(i18n.t("mutations:librarySource.playlistUpToDate"));
      } else if (result.status === "not_synced_provider") {
        toast.error(i18n.t("mutations:librarySource.playlistNotLinked"));
      } else {
        toast.error(i18n.t("mutations:librarySource.playlistNotFound"));
      }
    },
    onError: (error) => errorToast(error, "librarySource.playlistSyncFailed"),
  });
}
