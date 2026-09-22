import { toast } from "sonner";

import { errorToast, extractAppCode } from "@modules/errors";
import { trpc } from "@utils/trpc";

export function useTriggerJob() {
  const utils = trpc.useUtils();
  return trpc.jobs.trigger.useMutation({
    onSuccess: (result) => {
      utils.jobs.list.invalidate();
      toast.success(result.message);
    },
    onError: (error) => {
      if (extractAppCode(error) === "JOB_ALREADY_RUNNING") {
        utils.jobs.list.invalidate();
        return;
      }
      errorToast(error, "jobs.runFailed");
    },
  });
}
