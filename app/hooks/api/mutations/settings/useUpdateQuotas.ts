import { toast } from "sonner";

import i18n from "@locale";
import { errorToast } from "@modules/errors";
import { trpc } from "@utils/trpc";

export function useUpdateQuotas() {
  const utils = trpc.useUtils();

  return trpc.settings.updateQuotas.useMutation({
    onSuccess: () => {
      utils.settings.get.invalidate();
      utils.users.list.invalidate();
      utils.requests.myQuota.invalidate();
      toast.success(i18n.t("mutations:settings.quotasSaved"));
    },
    onError: (error) => errorToast(error, "settings.quotasFailed"),
  });
}
