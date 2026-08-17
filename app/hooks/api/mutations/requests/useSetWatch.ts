import i18n from "@locale";
import { errorToast } from "@modules/errors";
import { useQueryClient } from "@tanstack/react-query";
import { trpc } from "@utils/trpc";
import { toast } from "sonner";

import { patchCachedDetailTracks } from "./helpers";

export function useSetWatch() {
  const utils = trpc.useUtils();
  const queryClient = useQueryClient();

  return trpc.requests.setWatch.useMutation({
    onMutate: async ({ trackId, enabled }) => {
      await utils.requests.getDetail.cancel();

      patchCachedDetailTracks(queryClient, (track) =>
        track.id === trackId
          ? {
              ...track,
              watch_enabled: enabled,
              next_retry_at: null,
              retry_count: enabled ? 0 : track.retry_count,
            }
          : track
      );
    },
    onError: (err) => {
      void utils.requests.getDetail.invalidate();
      errorToast(err, "requests.setWatchFailed");
    },
    onSuccess: (data) =>
      toast.success(i18n.t(data.enabled ? "mutations:requests.watchResumed" : "mutations:requests.watchStopped")),
    onSettled: () => {
      void utils.requests.getAll.invalidate();
      void utils.requests.getDetail.invalidate();
    },
  });
}
