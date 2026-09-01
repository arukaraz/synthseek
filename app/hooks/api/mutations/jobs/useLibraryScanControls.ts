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

export function useKeepBestLibraryCopy() {
  const utils = trpc.useUtils();
  return trpc.library.scan.keepBestCopy.useMutation({
    onSuccess: (result) => {
      utils.library.scan.duplicateGroups.invalidate();
      utils.library.scan.status.invalidate();
      toast.success(
        result.skipped
          ? i18n.t("settings:libraryScan.duplicates.tidySkipped")
          : i18n.t("settings:libraryScan.duplicates.tidyDone", { size: formatBytes(result.freedBytes) })
      );
    },
    onError: (error) => errorToast(error, "jobs.runFailed"),
  });
}

export function useDiscardLibraryCopy() {
  const utils = trpc.useUtils();
  return trpc.library.scan.discardCopy.useMutation({
    onSuccess: () => {
      utils.library.scan.duplicateGroups.invalidate();
      utils.library.scan.status.invalidate();
      toast.success(i18n.t("settings:libraryScan.duplicates.discarded"));
    },
    onError: (error) => errorToast(error, "jobs.runFailed"),
  });
}

export function useKeepBestLibraryCopies() {
  const utils = trpc.useUtils();
  return trpc.library.scan.keepBestCopies.useMutation({
    onSuccess: () => {
      utils.library.scan.status.invalidate();
      utils.library.scan.duplicateGroups.invalidate();
      toast.success(i18n.t("settings:libraryScan.duplicates.tidyAllRunning"));
    },
    onError: (error) => errorToast(error, "jobs.runFailed"),
  });
}
