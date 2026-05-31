import { toast } from "sonner";

import { trpc } from "@utils/trpc";

export function useUpdateUser() {
  const utils = trpc.useUtils();
  return trpc.users.update.useMutation({
    onSuccess: (user) => {
      utils.users.list.invalidate();
      toast.success(`User ${user.username} updated`);
    },
    onError: (error) => toast.error(error.message || "Failed to update user"),
  });
}
