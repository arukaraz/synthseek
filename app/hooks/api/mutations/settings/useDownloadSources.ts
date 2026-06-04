import { toast } from "sonner";

import i18n from "@locale";
import { errorToast } from "@modules/errors";
import { trpc } from "@utils/trpc";

export function useUpdateDownloadSources() {
  const utils = trpc.useUtils();
  return trpc.settings.updateDownloadSources.useMutation({
    onSuccess: () => {
      utils.settings.get.invalidate();
      toast.success(i18n.t("mutations:settings.downloadSourcesSaved"));
    },
    onError: (error) => errorToast(error, "settings.downloadSourcesFailed"),
  });
}
