import { toast } from "sonner";

import { trpc } from "@utils/trpc";

export function useUpdateProfile() {
  const utils = trpc.useUtils();
  return trpc.auth.updateProfile.useMutation({
    onSuccess: (user) => {
      utils.auth.me.setData(undefined, user);
      utils.auth.me.invalidate();
      toast.success("Profile updated");
    },
    onError: (error) => toast.error(error.message || "Failed to update profile"),
  });
}
