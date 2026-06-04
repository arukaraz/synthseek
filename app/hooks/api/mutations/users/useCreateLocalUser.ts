import { toast } from "sonner";

import { errorToast } from "@modules/errors";
import { trpc } from "@utils/trpc";

export function useCreateLocalUser() {
  const utils = trpc.useUtils();
  return trpc.users.create.useMutation({
    onSuccess: (user) => {
      utils.users.list.invalidate();
      toast.success(`User ${user.username} created`);
    },
    onError: (error) => errorToast(error, "users.createFailed"),
  });
}
