import i18n from "@locale";
import { errorToast } from "@modules/errors";
import { trpc } from "@utils/trpc";
import { toast } from "sonner";

export function useResumeAll() {
  const utils = trpc.useUtils();

  return trpc.requests.resumeAll.useMutation({
    onError: (error) => errorToast(error, "requests.resumeAllFailed"),
    onSuccess: () => toast.success(i18n.t("mutations:requests.queueResumed")),
    onSettled: () => {
      utils.requests.getAll.invalidate();
      utils.requests.getQueueState.invalidate();
    },
  });
}
