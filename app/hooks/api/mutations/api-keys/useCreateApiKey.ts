import { toast } from "sonner";

import { trpc } from "@utils/trpc";

export function useCreateApiKey() {
  const utils = trpc.useUtils();
  return trpc.apiKeys.create.useMutation({
    onSuccess: () => {
      utils.apiKeys.list.invalidate();
    },
    onError: (error) => toast.error(error.message || "Failed to create API key"),
  });
}
