import i18n from "@locale";
import { errorToast } from "@modules/errors";
import { trpc } from "@utils/trpc";

import { invalidateRequestListQueries } from "../../queries/requests/requestListCache";
import { toast } from "sonner";

export function usePauseAll() {
  const utils = trpc.useUtils();

  return trpc.requests.pauseAll.useMutation({
    onError: (error) => errorToast(error, "requests.pauseAllFailed"),
    onSuccess: () => toast.success(i18n.t("mutations:requests.queuePaused")),
    onSettled: () => {
      invalidateRequestListQueries(utils);
      utils.requests.getQueueState.invalidate();
    },
  });
}
