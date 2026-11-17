import { toast } from "sonner";

import i18n from "@locale";
import { errorToast } from "@modules/errors";
import { trpc } from "@utils/trpc";

export function useStartCoverArtCount() {
  const utils = trpc.useUtils();
  return trpc.maintenance.startCoverArtCount.useMutation({
    onSuccess: () => {
      utils.maintenance.coverArtCount.invalidate();
    },
    onError: (error) => errorToast(error, "settings.coverArtCountFailed"),
  });
}

export function useFillCoverArt() {
  const utils = trpc.useUtils();
  return trpc.maintenance.fillCoverArt.useMutation({
    onSuccess: ({ outcome }) => {
      utils.maintenance.coverArtCount.invalidate();
      utils.maintenance.coverArtFillStatus.invalidate();
      if (outcome === "started") toast.success(i18n.t("mutations:settings.coverArtFillStarted"));
      else if (outcome === "already_running") toast.info(i18n.t("mutations:settings.coverArtFillAlreadyRunning"));
      else if (outcome === "library_busy") toast.info(i18n.t("mutations:settings.coverArtFillLibraryBusy"));
      else toast.info(i18n.t("mutations:settings.coverArtFillNothing"));
    },
    onError: (error) => errorToast(error, "settings.coverArtFillFailed"),
  });
}
