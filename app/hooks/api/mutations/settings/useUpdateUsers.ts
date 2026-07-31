import { toast } from "sonner";

import i18n from "@locale";
import { errorToast } from "@modules/errors";
import { trpc } from "@utils/trpc";

export function useUpdateUsers() {
  const utils = trpc.useUtils();

  return trpc.settings.updateUsers.useMutation({
    onSuccess: () => {
      utils.settings.get.invalidate();
      toast.success(i18n.t("mutations:settings.usersSaved"));
    },
    onError: (error) => errorToast(error, "settings.usersFailed"),
  });
}
