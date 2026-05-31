import { toast } from "sonner";

import { trpc } from "@utils/trpc";

export function useUpdateDownloadSources() {
  const utils = trpc.useUtils();
  return trpc.settings.updateDownloadSources.useMutation({
    onSuccess: () => {
      utils.settings.get.invalidate();
      toast.success("Download sources updated");
    },
    onError: (error) => toast.error(error.message || "Failed to update download sources"),
  });
}
