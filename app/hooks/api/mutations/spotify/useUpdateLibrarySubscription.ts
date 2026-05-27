import { toast } from "sonner";

import { trpc } from "@utils/trpc";

export function useUpdateLibrarySubscription() {
  const utils = trpc.useUtils();
  return trpc.librarySource.subscription.update.useMutation({
    onSuccess: () => {
      utils.librarySource.subscription.get.invalidate();
    },
    onError: (error) => toast.error(error.message || "Failed to update library watcher"),
  });
}
