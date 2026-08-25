import { toast } from "sonner";

import i18n from "@locale";
import { errorToast } from "@modules/errors";
import { trpc } from "@utils/trpc";

export function useUpdateConnectApps() {
  const utils = trpc.useUtils();

  return trpc.settings.updateConnectApps.useMutation({
    onSuccess: () => {
      utils.settings.get.invalidate();
      utils.subsonic.status.invalidate();
      toast.success(i18n.t("mutations:subsonic.settingsSaved"));
    },
    onError: (error) => errorToast(error, "subsonic.settingsFailed"),
  });
}
