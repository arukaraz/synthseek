import { errorToast } from "@modules/errors";
import { trpc } from "@utils/trpc";

export function useSyncAllPlaylistsTo() {
  const utils = trpc.useUtils();

  return trpc.requests.syncAllPlaylistsTo.useMutation({
    onError: (error) => errorToast(error, "requests.syncAllPlaylistsFailed"),
    onSuccess: (data) => {
      utils.requests.getPlaylistSyncAllState.setData(undefined, {
        running: data.running,
        server: data.server,
        synced: data.synced,
        total: data.total,
      });
    },
  });
}
