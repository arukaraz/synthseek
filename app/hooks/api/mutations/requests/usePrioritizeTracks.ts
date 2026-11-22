import { errorToast } from "@modules/errors";
import { notifyTrackBatch } from "@utils/request-helpers";
import { trpc } from "@utils/trpc";

export function usePrioritizeTracks() {
  const utils = trpc.useUtils();

  return trpc.requests.prioritizeTracks.useMutation({
    onError: (error) => errorToast(error, "requests.prioritizeTracksFailed"),
    onSuccess: (result) => notifyTrackBatch(result, "prioritize"),
    onSettled: () => {
      void utils.requests.getAll.invalidate();
      void utils.requests.getDetail.invalidate();
    },
  });
}
