import { toast } from "sonner";

import i18n from "@locale";
import { errorToast } from "@modules/errors";
import { trpc } from "@utils/trpc";

const APPLY_REFUSALS = {
  invalid_template: "libraryNaming.toast.invalidTemplate",
  organise_busy: "libraryNaming.toast.organiseBusy",
  already_running: "libraryOrganise.toast.alreadyRunning",
  plan_expired: "libraryOrganise.toast.planExpired",
  scan_busy: "libraryOrganise.toast.scanBusy",
  not_found: "libraryPaths.toast.notFound",
} as const;

export function useSaveAndOrganise() {
  const utils = trpc.useUtils();
  return trpc.library.naming.saveAndOrganise.useMutation({
    onSuccess: (result) => {
      utils.library.paths.list.invalidate();
      utils.library.organise.status.invalidate();
      if (result.outcome === "started") {
        toast.success(i18n.t("settings:libraryOrganise.toast.started"));
        return;
      }
      toast.warning(i18n.t(`settings:${APPLY_REFUSALS[result.outcome]}`));
    },
    onError: (error) => errorToast(error, "settings.namingFailed"),
  });
}
