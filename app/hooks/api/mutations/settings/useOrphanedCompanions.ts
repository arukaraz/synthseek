import { toast } from "sonner";

import i18n from "@locale";
import { errorToast } from "@modules/errors";
import { trpc } from "@utils/trpc";

export function useSweepOrphanedCompanions() {
  const utils = trpc.useUtils();
  return trpc.maintenance.sweepOrphanedCompanions.useMutation({
    onSuccess: ({ outcome }) => {
      utils.maintenance.orphanSweepStatus.invalidate();
      if (outcome === "started") toast.success(i18n.t("mutations:settings.orphanedCompanionsSweepStarted"));
      else if (outcome === "already_running")
        toast.info(i18n.t("mutations:settings.orphanedCompanionsSweepAlreadyRunning"));
      else toast.info(i18n.t("mutations:settings.orphanedCompanionsSweepLibraryBusy"));
    },
    onError: (error) => errorToast(error, "settings.orphanedCompanionsSweepFailed"),
  });
}
