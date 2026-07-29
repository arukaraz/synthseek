import { toast } from "sonner";

import i18n from "@locale";
import { errorToast } from "@modules/errors";
import { trpc } from "@utils/trpc";

export function useRemoveQuarantineEntry() {
  const utils = trpc.useUtils();
  return trpc.settings.quarantine.remove.useMutation({
    onSuccess: () => {
      utils.settings.quarantine.list.invalidate();
      toast.success(i18n.t("mutations:settings.quarantineEntryRemoved"));
    },
    onError: (error) => errorToast(error, "settings.quarantineRemoveFailed"),
  });
}

export function useClearQuarantine() {
  const utils = trpc.useUtils();
  return trpc.settings.quarantine.clear.useMutation({
    onSuccess: () => {
      utils.settings.quarantine.list.invalidate();
      toast.success(i18n.t("mutations:settings.quarantineCleared"));
    },
    onError: (error) => errorToast(error, "settings.quarantineClearFailed"),
  });
}
