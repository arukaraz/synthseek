import { RequestStatus } from "@api/__generated__/types";
import i18n from "@locale";
import { errorToast } from "@modules/errors";
import { useQueryClient } from "@tanstack/react-query";
import { trpc } from "@utils/trpc";
import { toast } from "sonner";

import { patchCachedDetailTracks } from "./helpers";

export function usePrioritizePlaylist() {
  const utils = trpc.useUtils();
  const queryClient = useQueryClient();

  return trpc.requests.prioritizePlaylist.useMutation({
    onMutate: async ({ playlistId }) => {
      await utils.requests.getDetail.cancel();

      patchCachedDetailTracks(
        queryClient,
        (track) =>
          track.status === RequestStatus.enum.queued && track.priority === 0 ? { ...track, priority: 1 } : track,
        playlistId
      );
    },
    onError: (err) => {
      void utils.requests.getDetail.invalidate();
      errorToast(err, "requests.prioritizePlaylistFailed");
    },
    onSuccess: () => toast.success(i18n.t("mutations:requests.playlistPrioritized")),
    onSettled: () => {
      void utils.requests.getAll.invalidate();
      void utils.requests.getDetail.invalidate();
    },
  });
}
