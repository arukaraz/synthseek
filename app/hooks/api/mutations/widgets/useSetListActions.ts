import { toast } from "sonner";

import i18n from "@locale";
import { errorToast } from "@modules/errors";
import { trpc } from "@utils/trpc";

function useSetInvalidation() {
  const utils = trpc.useUtils();
  return () => {
    void utils.widgets.data.invalidate();
    void utils.widgets.setList.invalidate();
    void utils.widgets.list.invalidate();
  };
}

export function useRebuildSet() {
  const invalidate = useSetInvalidation();
  return trpc.widgets.rebuildSet.useMutation({
    onSuccess: () => {
      invalidate();
      toast.success(i18n.t("mutations:widgets.setRebuilt"));
    },
    onError: (error) => errorToast(error, "widgets.setRebuildFailed"),
  });
}

export function usePinSetList() {
  const invalidate = useSetInvalidation();
  return trpc.widgets.pinSetList.useMutation({
    onSuccess: invalidate,
    onError: (error) => errorToast(error, "widgets.setPinFailed"),
  });
}

export function useRestoreSetVersion() {
  const invalidate = useSetInvalidation();
  return trpc.widgets.restoreSetVersion.useMutation({
    onSuccess: () => {
      invalidate();
      toast.success(i18n.t("mutations:widgets.setRestored"));
    },
    onError: (error) => errorToast(error, "widgets.setRestoreFailed"),
  });
}

export function useSaveSetCopy() {
  const utils = trpc.useUtils();
  return trpc.widgets.saveSetCopy.useMutation({
    onSuccess: () => {
      void utils.widgets.setList.invalidate();
      toast.success(i18n.t("mutations:widgets.setCopySaved"));
    },
    onError: (error) => errorToast(error, "widgets.setCopyFailed"),
  });
}

export function useRateTrack() {
  const invalidate = useSetInvalidation();
  return trpc.widgets.rateTrack.useMutation({
    onSuccess: invalidate,
    onError: (error) => errorToast(error, "widgets.setRateFailed"),
  });
}

export function useRecordSkip() {
  return trpc.widgets.recordSkip.useMutation();
}
