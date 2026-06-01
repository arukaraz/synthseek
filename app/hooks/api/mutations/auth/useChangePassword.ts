import { toast } from "sonner";

import { trpc } from "@utils/trpc";

export function useChangePassword() {
  return trpc.auth.changePassword.useMutation({
    onSuccess: () => toast.success("Password changed"),
    onError: (error) => toast.error(error.message || "Failed to change password"),
  });
}
