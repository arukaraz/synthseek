import { toast } from "sonner";

import i18n from "@locale";
import { errorToast } from "@modules/errors";
import { trpc } from "@utils/trpc";

export function useStartLibraryOrganise() {
  const utils = trpc.useUtils();
  return trpc.library.organise.start.useMutation({
    onSuccess: (result) => {
      utils.library.organise.status.invalidate();
      if (result.outcome === "started") {
        toast.success(i18n.t("settings:libraryOrganise.toast.started"));
        return;
      }
      if (result.outcome === "already_running") {
        toast.success(i18n.t("settings:libraryOrganise.toast.alreadyRunning"));
        return;
      }
      if (result.outcome === "scan_busy") {
        toast.warning(i18n.t("settings:libraryOrganise.toast.scanBusy"));
        return;
      }
      utils.library.organise.preview.invalidate();
      toast.warning(i18n.t("settings:libraryOrganise.toast.planExpired"));
    },
    onError: (error) => errorToast(error, "jobs.runFailed"),
  });
}

export function useCancelLibraryOrganise() {
  const utils = trpc.useUtils();
  return trpc.library.organise.cancel.useMutation({
    onSuccess: (result) => {
      utils.library.organise.status.invalidate();
      toast.success(
        result.cancelling
          ? i18n.t("settings:libraryOrganise.toast.cancelling")
          : i18n.t("settings:libraryOrganise.toast.nothingRunning")
      );
    },
    onError: (error) => errorToast(error, "jobs.runFailed"),
  });
}
