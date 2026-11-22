import { errorToast } from "@modules/errors";
import { notifyTrackBatch } from "@utils/request-helpers";
import { trpc } from "@utils/trpc";

export function useCancelTracks() {
  const utils = trpc.useUtils();

  return trpc.requests.cancelTracks.useMutation({
    onError: (error) => errorToast(error, "requests.cancelTracksFailed"),
    onSuccess: (result) => notifyTrackBatch(result, "cancel"),
    onSettled: () => {
      void utils.requests.getAll.invalidate();
      void utils.requests.getDetail.invalidate();
    },
  });
}
