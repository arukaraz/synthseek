import { RequestStatus } from "@api/__generated__/types";
import i18n from "@locale";
import { errorToast } from "@modules/errors";
import { useQueryClient } from "@tanstack/react-query";
import { trpc } from "@utils/trpc";
import { toast } from "sonner";

import { patchCachedDetailTracks } from "./helpers";

export function useRetryTrack() {
  const utils = trpc.useUtils();
  const queryClient = useQueryClient();

  return trpc.requests.retryTrack.useMutation({
    onMutate: async ({ trackId }) => {
      await utils.requests.getDetail.cancel();

      patchCachedDetailTracks(queryClient, (track) =>
        track.id === trackId ? { ...track, status: RequestStatus.enum.queued, progress: 0, error: null } : track
      );
    },
    onError: (err) => {
      void utils.requests.getDetail.invalidate();
      errorToast(err, "requests.retryTrackFailed");
    },
    onSuccess: () => toast.success(i18n.t("mutations:requests.trackRetryQueued")),
    onSettled: () => {
      void utils.requests.getAll.invalidate();
      void utils.requests.getDetail.invalidate();
      void utils.library.getTracks.invalidate();
      void utils.library.getCounts.invalidate();
    },
  });
}
