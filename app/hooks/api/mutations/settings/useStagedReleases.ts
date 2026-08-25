import { toast } from "sonner";

import i18n from "@locale";
import { errorToast } from "@modules/errors";
import { trpc } from "@utils/trpc";

export function useRemoveStagedRelease() {
  const utils = trpc.useUtils();
  return trpc.settings.stagedReleases.remove.useMutation({
    onSuccess: () => {
      utils.settings.stagedReleases.list.invalidate();
      toast.success(i18n.t("mutations:settings.stagedReleaseRemoved"));
    },
    onError: (error) => errorToast(error, "settings.stagedReleaseRemoveFailed"),
  });
}

export function useClearStagedReleases() {
  const utils = trpc.useUtils();
  return trpc.settings.stagedReleases.clear.useMutation({
    onSuccess: () => {
      utils.settings.stagedReleases.list.invalidate();
      toast.success(i18n.t("mutations:settings.stagedReleasesCleared"));
    },
    onError: (error) => errorToast(error, "settings.stagedReleasesClearFailed"),
  });
}
