import { toast } from "sonner";

import { trpc } from "@utils/trpc";

export function useUpdateLastfm() {
  const utils = trpc.useUtils();
  return trpc.discovery.updateLastfm.useMutation({
    onSuccess: () => {
      utils.discovery.getConfig.invalidate();
      toast.success("Last.fm discovery settings saved");
    },
    onError: (error) => toast.error(error.message || "Failed to save Last.fm settings"),
  });
}
