import { toast } from "sonner";

import { trpc } from "@utils/trpc";

export function useUpdateLogLevel() {
  const utils = trpc.useUtils();
  return trpc.settings.updateSystemLogLevel.useMutation({
    onSuccess: () => {
      utils.settings.get.invalidate();
      toast.success("Log level updated");
    },
    onError: (error) => toast.error(error.message || "Failed to update log level"),
  });
}
