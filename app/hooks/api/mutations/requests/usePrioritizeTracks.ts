import { errorToast } from "@modules/errors";
import { notifyTrackBatch } from "@utils/request-helpers";
import { trpc } from "@utils/trpc";

import { invalidateRequestListQueries } from "../../queries/requests/requestListCache";

export function usePrioritizeTracks() {
  const utils = trpc.useUtils();

  return trpc.requests.prioritizeTracks.useMutation({
    onError: (error) => errorToast(error, "requests.prioritizeTracksFailed"),
    onSuccess: (result) => notifyTrackBatch(result, "prioritize"),
    onSettled: () => {
      invalidateRequestListQueries(utils);
      void utils.requests.getDetail.invalidate();
    },
  });
}
