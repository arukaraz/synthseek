import i18n from "@locale";
import { errorToast } from "@modules/errors";
import { trpc } from "@utils/trpc";
import { toast } from "sonner";

export function usePauseAll() {
  const utils = trpc.useUtils();

  return trpc.requests.pauseAll.useMutation({
    onError: (error) => errorToast(error, "requests.pauseAllFailed"),
    onSuccess: () => toast.success(i18n.t("mutations:requests.queuePaused")),
    onSettled: () => {
      utils.requests.getAll.invalidate();
      utils.requests.getQueueState.invalidate();
    },
  });
}
