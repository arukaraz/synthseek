import { toast } from "sonner";

import { trpc } from "@utils/trpc";

export function useRevokeApiKey() {
  const utils = trpc.useUtils();
  return trpc.apiKeys.revoke.useMutation({
    onSuccess: () => {
      utils.apiKeys.list.invalidate();
      toast.success("API key revoked");
    },
    onError: (error) => toast.error(error.message || "Failed to revoke API key"),
  });
}
