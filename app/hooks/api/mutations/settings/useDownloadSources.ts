import { toast } from "sonner";

import i18n from "@locale";
import { errorToast } from "@modules/errors";
import { trpc } from "@utils/trpc";

export function useUpdateDownloadSources() {
  const utils = trpc.useUtils();
  return trpc.settings.updateDownloadSources.useMutation({
    onSuccess: () => {
      utils.settings.get.invalidate();
      utils.settings.downloadSourcesAvailability.invalidate();
      toast.success(i18n.t("mutations:settings.downloadSourcesSaved"));
    },
    onError: (error) => errorToast(error, "settings.downloadSourcesFailed"),
  });
}

export function useUpdateDownloadSourceOrder() {
  const utils = trpc.useUtils();
  return trpc.settings.updateDownloadSourceOrder.useMutation({
    onSuccess: async () => {
      await Promise.all([utils.settings.get.invalidate(), utils.settings.downloadSourcesAvailability.invalidate()]);
      toast.success(i18n.t("mutations:settings.downloadSourceOrderSaved"));
    },
    onError: (error) => errorToast(error, "settings.downloadSourceOrderFailed"),
  });
}

export function useTestSubsonicSource() {
  return trpc.settings.testSubsonicSource.useMutation();
}

export function useTestTorrentSource() {
  return trpc.settings.testTorrentSource.useMutation();
}
