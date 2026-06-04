import i18n from "@locale";
import { errorToast } from "@modules/errors";
import { trpc } from "@utils/trpc";
import { toast } from "sonner";

export function useRetryAllFailed() {
  const utils = trpc.useUtils();

  return trpc.requests.retryAllFailed.useMutation({
    onError: (error) => errorToast(error, "requests.retryAllFailed"),
    onSuccess: (data) => {
      if (data.retried > 0) {
        toast.success(i18n.t("mutations:requests.retrying", { count: data.retried }));
      } else {
        toast.info(i18n.t("mutations:requests.noFailedToRetry"));
      }
    },
    onSettled: () => utils.requests.getAll.invalidate(),
  });
}
