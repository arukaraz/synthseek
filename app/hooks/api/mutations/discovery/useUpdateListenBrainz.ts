import { toast } from "sonner";

import { trpc } from "@utils/trpc";

export function useUpdateListenBrainz() {
  const utils = trpc.useUtils();
  return trpc.discovery.updateListenBrainz.useMutation({
    onSuccess: () => {
      utils.discovery.getConfig.invalidate();
      toast.success("ListenBrainz settings saved");
    },
    onError: (error) => toast.error(error.message || "Failed to save ListenBrainz settings"),
  });
}
