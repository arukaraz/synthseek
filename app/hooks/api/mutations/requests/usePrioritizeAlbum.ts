import { RequestStatus } from "@api/__generated__/types";
import i18n from "@locale";
import { errorToast } from "@modules/errors";
import { useQueryClient } from "@tanstack/react-query";
import { trpc } from "@utils/trpc";

import { invalidateRequestListQueries } from "../../queries/requests/requestListCache";
import { toast } from "sonner";

import { patchCachedDetailTracks } from "./helpers";

export function usePrioritizeAlbum() {
  const utils = trpc.useUtils();
  const queryClient = useQueryClient();

  return trpc.requests.prioritizeAlbum.useMutation({
    onMutate: async ({ albumId }) => {
      await utils.requests.getDetail.cancel();

      patchCachedDetailTracks(
        queryClient,
        (track) =>
          track.status === RequestStatus.enum.queued && track.priority === 0 ? { ...track, priority: 1 } : track,
        albumId
      );
    },
    onError: (err) => {
      void utils.requests.getDetail.invalidate();
      errorToast(err, "requests.prioritizeAlbumFailed");
    },
    onSuccess: () => toast.success(i18n.t("mutations:requests.albumPrioritized")),
    onSettled: () => {
      invalidateRequestListQueries(utils);
      void utils.requests.getDetail.invalidate();
    },
  });
}
