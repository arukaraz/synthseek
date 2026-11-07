import { toast } from "sonner";

import i18n from "@locale";
import { errorToast } from "@modules/errors";
import { trpc } from "@utils/trpc";
import { formatBytes } from "@utils/formatters";

export function useCancelLibraryScan() {
  const utils = trpc.useUtils();
  return trpc.library.scan.cancel.useMutation({
    onSuccess: (result) => {
      utils.library.scan.status.invalidate();
      toast.success(
        result.requested
          ? i18n.t("settings:libraryScan.toast.cancelling")
          : i18n.t("settings:libraryScan.toast.nothingRunning")
      );
    },
    onError: (error) => errorToast(error, "jobs.runFailed"),
  });
}

export function useScanLibraryPath() {
  const utils = trpc.useUtils();
  return trpc.library.scan.scanPath.useMutation({
    onSuccess: (result) => {
      utils.library.scan.status.invalidate();
      if (result.outcome === "already_running") toast.info(i18n.t("settings:libraryScan.toast.alreadyRunning"));
      if (result.outcome === "not_found") toast.error(i18n.t("settings:libraryScan.toast.pathNotFound"));
    },
    onError: (error) => errorToast(error, "jobs.runFailed"),
  });
}

export function useKeepThisCopy() {
  const utils = trpc.useUtils();
  return trpc.library.scan.keepThisCopy.useMutation({
    onSuccess: (result) => {
      utils.library.scan.duplicateGroups.invalidate();
      utils.library.scan.status.invalidate();
      toast.success(i18n.t("settings:libraryScan.duplicates.keepThisDone", { size: formatBytes(result.freedBytes) }));
    },
    onError: (error) => errorToast(error, "jobs.runFailed"),
  });
}

export function useRejectCopies() {
  const utils = trpc.useUtils();
  return trpc.library.scan.rejectCopies.useMutation({
    onSuccess: (result) => {
      utils.library.scan.duplicateGroups.invalidate();
      utils.library.scan.status.invalidate();
      utils.settings.quarantine.list.invalidate();
      toast.success(
        i18n.t(
          result.searching
            ? "settings:libraryScan.duplicates.reject.searchingDone"
            : "settings:libraryScan.duplicates.reject.rejectDone",
          { count: result.recycled, size: formatBytes(result.freedBytes) }
        )
      );
      if (result.unheard > 0) {
        toast.warning(i18n.t("settings:libraryScan.duplicates.reject.unheard", { count: result.unheard }));
      }
    },
    onError: (error) => errorToast(error, "jobs.runFailed"),
  });
}
