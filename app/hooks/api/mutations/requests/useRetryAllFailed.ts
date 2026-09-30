import { errorToast } from "@modules/errors";
import { notifyRequestsRetried } from "@utils/request-helpers";
import { trpc } from "@utils/trpc";

export function useRetryAllFailed() {
  const utils = trpc.useUtils();

  return trpc.requests.retryAllFailed.useMutation({
    onError: (error) => errorToast(error, "requests.retryAllFailed"),
    onSuccess: notifyRequestsRetried,
    onSettled: () => utils.requests.getAll.invalidate(),
  });
}
