import { toast } from "sonner";

import { trpc } from "@utils/trpc";

export function useBulkDeleteUsers() {
  const utils = trpc.useUtils();
  return trpc.users.bulkDelete.useMutation({
    onSuccess: (result) => {
      utils.users.list.invalidate();
      toast.success(`Deleted ${result.deleted} ${result.deleted === 1 ? "user" : "users"}`);
    },
    onError: (error) => toast.error(error.message || "Failed to delete users"),
  });
}
