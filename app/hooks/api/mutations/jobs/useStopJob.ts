import { toast } from "sonner";

import { errorToast, extractAppCode } from "@modules/errors";
import { trpc } from "@utils/trpc";

export function useStopJob() {
  const utils = trpc.useUtils();
  return trpc.jobs.stop.useMutation({
    onSuccess: (result) => {
      utils.jobs.list.invalidate();
      toast.success(result.message);
    },
    onError: (error) => {
      if (extractAppCode(error) === "JOB_NOT_RUNNING") {
        utils.jobs.list.invalidate();
        return;
      }
      errorToast(error, "jobs.stopFailed");
    },
  });
}
