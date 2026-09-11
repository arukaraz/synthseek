import { toast } from "sonner";

import i18n from "@locale";
import { errorToast } from "@modules/errors";
import { trpc } from "@utils/trpc";

export function useSweepOrphanedCompanions() {
  const utils = trpc.useUtils();
  return trpc.maintenance.sweepOrphanedCompanions.useMutation({
    onSuccess: ({ recycled }) => {
      utils.maintenance.orphanedCompanions.invalidate();
      utils.settings.recycleBin.status.invalidate();
      toast.success(i18n.t("mutations:settings.orphanedCompanionsSwept", { count: recycled }));
    },
    onError: (error) => errorToast(error, "settings.orphanedCompanionsSweepFailed"),
  });
}
