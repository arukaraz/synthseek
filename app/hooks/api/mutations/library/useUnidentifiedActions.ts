import { toast } from "sonner";

import { TOAST_ACTION_DURATION_MS } from "@components/ui/Toaster/constants";
import i18n from "@locale";
import { errorToast } from "@modules/errors";
import { trpc } from "@utils/trpc";

type TrpcUtils = ReturnType<typeof trpc.useUtils>;

function refreshReview(utils: TrpcUtils): void {
  void utils.library.scan.unidentified.list.invalidate();
  void utils.library.scan.status.invalidate();
}

export function useRetryUnidentified() {
  const utils = trpc.useUtils();
  return trpc.library.scan.unidentified.retry.useMutation({
    onSuccess: (result) => {
      refreshReview(utils);
      if (result.requested > 0) {
        toast.info(i18n.t("settings:libraryScan.review.toast.searching", { count: result.requested }));
      }
    },
    onError: (error) => errorToast(error),
  });
}

export function useIgnoreUnidentified() {
  const utils = trpc.useUtils();
  return trpc.library.scan.unidentified.ignore.useMutation({
    onSuccess: (result, variables) => {
      refreshReview(utils);
      if (result.ignored === 0) return;
      toast.success(i18n.t("settings:libraryScan.review.toast.ignored", { count: result.ignored }), {
        duration: TOAST_ACTION_DURATION_MS,
        action: {
          label: i18n.t("settings:libraryScan.review.toast.undo"),
          onClick: () => {
            utils.client.library.scan.unidentified.unignore
              .mutate({ fileIds: variables.fileIds, searchAgain: false })
              .then(() => refreshReview(utils))
              .catch((error: unknown) => errorToast(error));
          },
        },
      });
    },
    onError: (error) => errorToast(error),
  });
}

export function useStopIgnoringUnidentified() {
  const utils = trpc.useUtils();
  return trpc.library.scan.unidentified.unignore.useMutation({
    onSuccess: (result) => {
      refreshReview(utils);
      if (result.restored > 0) {
        toast.info(i18n.t("settings:libraryScan.review.toast.searching", { count: result.restored }));
      }
    },
    onError: (error) => errorToast(error),
  });
}

export function useAssignUnidentified() {
  const utils = trpc.useUtils();
  return trpc.library.scan.unidentified.assign.useMutation({
    onSuccess: (result) => {
      refreshReview(utils);
      void utils.library.scan.duplicateGroups.invalidate();
      if (result.added > 0) {
        toast.success(i18n.t("settings:libraryScan.review.toast.added", { count: result.added }));
      }
      if (result.alternates > 0) {
        toast.info(i18n.t("settings:libraryScan.review.toast.secondCopy", { count: result.alternates }));
      }
      if (result.ignored > 0) {
        toast.success(i18n.t("settings:libraryScan.review.toast.ignored", { count: result.ignored }));
      }
      if (result.skipped > 0) {
        toast.warning(i18n.t("settings:libraryScan.review.toast.skipped", { count: result.skipped }));
      }
    },
    onError: (error) => errorToast(error),
  });
}

export function useResolveUnidentifiedLink() {
  return trpc.library.scan.unidentified.resolveLink.useMutation({
    onError: (error) => errorToast(error),
  });
}
