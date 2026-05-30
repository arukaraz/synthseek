import { toast } from "sonner";

import { trpc } from "@utils/trpc";

export function useTriggerJob() {
  const utils = trpc.useUtils();
  return trpc.jobs.trigger.useMutation({
    onSuccess: (result) => {
      utils.jobs.list.invalidate();
      toast.success(result.message);
    },
    onError: (error) => toast.error(error.message || "Failed to run job"),
  });
}
