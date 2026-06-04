import { toast } from "sonner";

import i18n from "@locale";
import { errorToast } from "@modules/errors";
import { trpc } from "@utils/trpc";

export function useDeleteUser() {
  const utils = trpc.useUtils();
  return trpc.users.delete.useMutation({
    onSuccess: () => {
      utils.users.list.invalidate();
      toast.success(i18n.t("mutations:users.deleted"));
    },
    onError: (error) => errorToast(error, "users.deleteFailed"),
  });
}
