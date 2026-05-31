import { toast } from "sonner";

import { trpc } from "@utils/trpc";

export function useBulkUpdateRole() {
  const utils = trpc.useUtils();
  return trpc.users.bulkUpdateRole.useMutation({
    onSuccess: (result) => {
      utils.users.list.invalidate();
      toast.success(`Updated ${result.updated} ${result.updated === 1 ? "user" : "users"}`);
    },
    onError: (error) => toast.error(error.message || "Failed to update users"),
  });
}
