import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { RequestStatus } from "@api/__generated__/types";
import i18n from "@locale";
import { errorToast } from "@modules/errors";
import { trpc } from "@utils/trpc";

import { patchCachedApprovalDecision } from "./helpers";

export function useApproveTracks() {
  const utils = trpc.useUtils();
  const queryClient = useQueryClient();

  return trpc.requests.approve.useMutation({
    onMutate: async ({ trackIds }) => {
      await Promise.all([utils.requests.getAll.cancel(), utils.requests.getDetail.cancel()]);

      patchCachedApprovalDecision(queryClient, utils, trackIds, RequestStatus.enum.queued);
    },
    onError: (err) => {
      void utils.requests.getDetail.invalidate();
      errorToast(err, "requests.approveFailed");
    },
    onSuccess: ({ approved, skipped }) => {
      if (approved > 0) {
        toast.success(i18n.t("mutations:requests.tracksApproved", { count: approved }));
      } else if (skipped.length > 0) {
        toast.warning(i18n.t("mutations:requests.approveAllSkipped"));
      }
    },
    onSettled: () => {
      void utils.requests.getAll.invalidate();
      void utils.requests.getDetail.invalidate();
    },
  });
}
