import { toast } from "sonner";

import i18n from "@locale";
import { errorToast } from "@modules/errors";
import { trpc } from "@utils/trpc";

export function useSweepOrphanedCompanions() {
  const utils = trpc.useUtils();
  return trpc.maintenance.sweepOrphanedCompanions.useMutation({
    onSuccess: ({ started }) => {
      utils.maintenance.orphanSweepStatus.invalidate();
      if (started) toast.success(i18n.t("mutations:settings.orphanedCompanionsSweepStarted"));
      else toast.info(i18n.t("mutations:settings.orphanedCompanionsSweepAlreadyRunning"));
    },
    onError: (error) => errorToast(error, "settings.orphanedCompanionsSweepFailed"),
  });
}
