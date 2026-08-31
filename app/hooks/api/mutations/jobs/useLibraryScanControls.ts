import { toast } from "sonner";

import i18n from "@locale";
import { errorToast } from "@modules/errors";
import { trpc } from "@utils/trpc";

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

export function useDiscardLibraryCopy() {
  const utils = trpc.useUtils();
  return trpc.library.scan.discardCopy.useMutation({
    onSuccess: () => {
      utils.library.scan.alternateCopies.invalidate();
      utils.library.scan.status.invalidate();
      toast.success(i18n.t("settings:libraryScan.alternates.discarded"));
    },
    onError: (error) => errorToast(error, "jobs.runFailed"),
  });
}
