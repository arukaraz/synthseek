import { toast } from "sonner";

import i18n from "@locale";
import { errorToast } from "@modules/errors";
import { trpc } from "@utils/trpc";

export function useUpdateLogLevel() {
  const utils = trpc.useUtils();
  return trpc.settings.updateSystemLogLevel.useMutation({
    onSuccess: () => {
      utils.settings.get.invalidate();
      toast.success(i18n.t("mutations:settings.logLevelSaved"));
    },
    onError: (error) => errorToast(error, "settings.logLevelFailed"),
  });
}
