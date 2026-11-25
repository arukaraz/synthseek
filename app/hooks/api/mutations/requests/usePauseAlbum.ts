import { RequestStatus } from "@api/__generated__/types";
import i18n from "@locale";
import { errorToast } from "@modules/errors";
import { useQueryClient } from "@tanstack/react-query";
import { trpc } from "@utils/trpc";
import { toast } from "sonner";

import {
  cancelRequestList,
  invalidateRequestListQueries,
  patchRequestListItems,
  restoreRequestList,
  snapshotRequestList,
} from "../../queries/requests/requestListCache";
import { patchCachedDetailTracks } from "./helpers";

export function usePauseAlbum() {
  const utils = trpc.useUtils();
  const queryClient = useQueryClient();

  return trpc.requests.pauseAlbum.useMutation({
    onMutate: async ({ albumId }) => {
      await Promise.all([cancelRequestList(queryClient), utils.requests.getDetail.cancel()]);
      const previous = snapshotRequestList(queryClient);

      patchRequestListItems(queryClient, (item) =>
        item.id === albumId ? { ...item, status: RequestStatus.enum.paused } : item
      );

      patchCachedDetailTracks(
        queryClient,
        (track) =>
          track.status !== RequestStatus.enum.complete &&
          track.status !== RequestStatus.enum.failed &&
          track.status !== RequestStatus.enum.cancelled &&
          track.status !== RequestStatus.enum.paused
            ? { ...track, status: RequestStatus.enum.paused, progress: 0 }
            : track,
        albumId
      );

      return { previous };
    },
    onError: (err, _vars, context) => {
      if (context) restoreRequestList(queryClient, context.previous);
      void utils.requests.getDetail.invalidate();
      errorToast(err, "requests.pauseAlbumFailed");
    },
    onSuccess: () => toast.success(i18n.t("mutations:requests.albumPaused")),
    onSettled: () => {
      invalidateRequestListQueries(utils);
      void utils.requests.getDetail.invalidate();
    },
  });
}
