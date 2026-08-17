import i18n from "@locale";
import { errorToast } from "@modules/errors";
import { useQueryClient } from "@tanstack/react-query";
import { trpc } from "@utils/trpc";
import { toast } from "sonner";

import { patchCachedDetailTracks } from "./helpers";

export function usePrioritizeTrack() {
  const utils = trpc.useUtils();
  const queryClient = useQueryClient();

  return trpc.requests.prioritizeTrack.useMutation({
    onMutate: async ({ trackId }) => {
      await utils.requests.getDetail.cancel();

      patchCachedDetailTracks(queryClient, (track) => (track.id === trackId ? { ...track, priority: 1 } : track));
    },
    onError: (err) => {
      void utils.requests.getDetail.invalidate();
      errorToast(err, "requests.prioritizeTrackFailed");
    },
    onSuccess: () => toast.success(i18n.t("mutations:requests.trackPrioritized")),
    onSettled: () => {
      void utils.requests.getAll.invalidate();
      void utils.requests.getDetail.invalidate();
    },
  });
}
