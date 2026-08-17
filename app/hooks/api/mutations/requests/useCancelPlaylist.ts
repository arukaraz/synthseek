import { RequestStatus } from "@api/__generated__/types";
import i18n from "@locale";
import { errorToast } from "@modules/errors";
import { useQueryClient } from "@tanstack/react-query";
import { trpc } from "@utils/trpc";
import { toast } from "sonner";

import { patchCachedDetailTracks } from "./helpers";

export function useCancelPlaylist() {
  const utils = trpc.useUtils();
  const queryClient = useQueryClient();

  return trpc.requests.cancelPlaylist.useMutation({
    onMutate: async ({ playlistId }) => {
      await Promise.all([utils.requests.getAll.cancel(), utils.requests.getDetail.cancel()]);
      const previous = utils.requests.getAll.getData();

      utils.requests.getAll.setData(undefined, (old) =>
        old?.map((item) => (item.id === playlistId ? { ...item, status: RequestStatus.enum.cancelled } : item))
      );

      patchCachedDetailTracks(
        queryClient,
        (track) =>
          track.status !== RequestStatus.enum.complete &&
          track.status !== RequestStatus.enum.failed &&
          track.status !== RequestStatus.enum.cancelled
            ? { ...track, status: RequestStatus.enum.cancelled, progress: 0 }
            : track,
        playlistId
      );

      return { previous };
    },
    onError: (err, _vars, context) => {
      if (context?.previous) utils.requests.getAll.setData(undefined, context.previous);
      void utils.requests.getDetail.invalidate();
      errorToast(err, "requests.cancelPlaylistFailed");
    },
    onSuccess: () => toast.success(i18n.t("mutations:requests.playlistCancelled")),
    onSettled: () => {
      void utils.requests.getAll.invalidate();
      void utils.requests.getDetail.invalidate();
    },
  });
}
