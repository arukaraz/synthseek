import { RequestStatus } from "@api/__generated__/types";
import i18n from "@locale";
import { errorToast } from "@modules/errors";
import { useQueryClient } from "@tanstack/react-query";
import { trpc } from "@utils/trpc";
import { toast } from "sonner";

import { patchCachedDetailTracks } from "./helpers";

export function useCancelTrack() {
  const utils = trpc.useUtils();
  const queryClient = useQueryClient();

  return trpc.requests.cancelTrack.useMutation({
    onMutate: async ({ trackId }) => {
      await utils.requests.getDetail.cancel();

      patchCachedDetailTracks(queryClient, (track) =>
        track.id === trackId ? { ...track, status: RequestStatus.enum.cancelled, progress: 0 } : track
      );
    },
    onError: (err) => {
      void utils.requests.getDetail.invalidate();
      errorToast(err, "requests.cancelTrackFailed");
    },
    onSuccess: () => toast.success(i18n.t("mutations:requests.trackCancelled")),
    onSettled: () => {
      void utils.requests.getAll.invalidate();
      void utils.requests.getDetail.invalidate();
    },
  });
}
