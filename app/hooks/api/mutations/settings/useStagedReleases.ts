import { toast } from "sonner";

import i18n from "@locale";
import { errorToast } from "@modules/errors";
import { trpc } from "@utils/trpc";

function useInvalidateStagedReleases() {
  const utils = trpc.useUtils();
  return () => {
    void utils.settings.stagedReleases.list.invalidate();
    void utils.requests.keptReleases.invalidate();
    void utils.maintenance.counts.invalidate();
  };
}

export function useRemoveStagedRelease() {
  const invalidate = useInvalidateStagedReleases();
  return trpc.settings.stagedReleases.remove.useMutation({
    onSuccess: () => {
      invalidate();
      toast.success(i18n.t("mutations:settings.stagedReleaseRemoved"));
    },
    onError: (error) => errorToast(error, "settings.stagedReleaseRemoveFailed"),
  });
}

export function useClearStagedReleases() {
  const invalidate = useInvalidateStagedReleases();
  return trpc.settings.stagedReleases.clear.useMutation({
    onSuccess: () => {
      invalidate();
      toast.success(i18n.t("mutations:settings.stagedReleasesCleared"));
    },
    onError: (error) => errorToast(error, "settings.stagedReleasesClearFailed"),
  });
}
