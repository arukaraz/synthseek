import { errorToast } from "@modules/errors";
import { notifyTrackBatch } from "@utils/request-helpers";
import { trpc } from "@utils/trpc";

import { invalidateRequestListQueries } from "../../queries/requests/requestListCache";

export function useCancelTracks() {
  const utils = trpc.useUtils();

  return trpc.requests.cancelTracks.useMutation({
    onError: (error) => errorToast(error, "requests.cancelTracksFailed"),
    onSuccess: (result) => notifyTrackBatch(result, "cancel"),
    onSettled: () => {
      invalidateRequestListQueries(utils);
      void utils.requests.getDetail.invalidate();
    },
  });
}
