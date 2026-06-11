import { errorToast } from "@modules/errors";
import { trpc } from "@utils/trpc";

export function useSyncAllPlaylistsToPlex() {
  const utils = trpc.useUtils();

  return trpc.requests.syncAllPlaylistsToPlex.useMutation({
    onError: (error) => errorToast(error, "requests.syncAllPlexFailed"),
    onSuccess: (data) => {
      utils.requests.getPlexSyncAllState.setData(undefined, {
        running: data.running,
        synced: data.synced,
        total: data.total,
      });
    },
  });
}
