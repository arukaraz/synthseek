import { toast } from "sonner";

import { trpc } from "@utils/trpc";

export function useDeleteUser() {
  const utils = trpc.useUtils();
  return trpc.users.delete.useMutation({
    onSuccess: () => {
      utils.users.list.invalidate();
      toast.success("User deleted");
    },
    onError: (error) => toast.error(error.message || "Failed to delete user"),
  });
}
