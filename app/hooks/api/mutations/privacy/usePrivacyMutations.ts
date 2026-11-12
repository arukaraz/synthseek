import { toast } from "sonner";

import i18n from "@locale";
import { errorToast } from "@modules/errors";
import { trpc } from "@utils/trpc";

export function useSetPrivateSession() {
  const utils = trpc.useUtils();
  return trpc.privacy.setPrivateSession.useMutation({
    onSuccess: () => utils.auth.me.invalidate(),
    onError: (error) => errorToast(error, "privacy.privateSessionFailed"),
  });
}

export function useClearListeningHistory() {
  const utils = trpc.useUtils();
  return trpc.privacy.clearHistory.useMutation({
    onSuccess: ({ cleared }) => {
      toast.success(i18n.t("mutations:privacy.historyCleared", { count: cleared }));
      void utils.invalidate();
    },
    onError: (error) => errorToast(error, "privacy.clearHistoryFailed"),
  });
}

export function useUpdateServerPrivacy() {
  const utils = trpc.useUtils();
  return trpc.privacy.updateServer.useMutation({
    onSuccess: () => {
      void utils.privacy.overview.invalidate();
      void utils.settings.get.invalidate();
    },
    onError: (error) => errorToast(error, "privacy.serverFailed"),
  });
}
