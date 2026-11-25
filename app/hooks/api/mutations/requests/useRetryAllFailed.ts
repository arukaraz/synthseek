import { errorToast } from "@modules/errors";
import { notifyRequestsRetried } from "@utils/request-helpers";
import { trpc } from "@utils/trpc";

import { invalidateRequestListQueries } from "../../queries/requests/requestListCache";

export function useRetryAllFailed() {
  const utils = trpc.useUtils();

  return trpc.requests.retryAllFailed.useMutation({
    onError: (error) => errorToast(error, "requests.retryAllFailed"),
    onSuccess: notifyRequestsRetried,
    onSettled: () => invalidateRequestListQueries(utils),
  });
}
