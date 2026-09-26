import i18n from "@locale";
import { errorToast } from "@modules/errors";
import { playbackServerName } from "@utils/playback-servers";
import { trpc } from "@utils/trpc";
import { toast } from "sonner";

export function useSyncPlaylistTo() {
  return trpc.requests.syncPlaylistTo.useMutation({
    onError: (error) => errorToast(error, "requests.syncPlaylistToFailed"),
    onSuccess: (_data, variables) =>
      toast.success(i18n.t("mutations:requests.playlistSyncedTo", { server: playbackServerName(variables.server) })),
  });
}
