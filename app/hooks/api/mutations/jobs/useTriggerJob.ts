import { toast } from "sonner";

import { errorToast } from "@modules/errors";
import { trpc } from "@utils/trpc";

export function useTriggerJob() {
  const utils = trpc.useUtils();
  return trpc.jobs.trigger.useMutation({
    onSuccess: (result) => {
      utils.jobs.list.invalidate();
      toast.success(result.message);
    },
    onError: (error) => errorToast(error, "jobs.runFailed"),
  });
}
