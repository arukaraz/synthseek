import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { RequestStatus } from "@api/__generated__/types";
import i18n from "@locale";
import { errorToast } from "@modules/errors";
import { trpc } from "@utils/trpc";

import { cancelRequestList, invalidateRequestListQueries } from "../../queries/requests/requestListCache";
import { patchCachedApprovalDecision } from "./helpers";

export function useRejectTracks() {
  const utils = trpc.useUtils();
  const queryClient = useQueryClient();

  return trpc.requests.reject.useMutation({
    onMutate: async ({ trackIds }) => {
      await Promise.all([cancelRequestList(queryClient), utils.requests.getDetail.cancel()]);

      patchCachedApprovalDecision(queryClient, trackIds, RequestStatus.enum.cancelled);
    },
    onError: (err) => {
      void utils.requests.getDetail.invalidate();
      errorToast(err, "requests.rejectFailed");
    },
    onSuccess: ({ rejected, skipped }) => {
      if (rejected > 0) {
        toast.success(i18n.t("mutations:requests.tracksRejected", { count: rejected }));
      } else if (skipped.length > 0) {
        toast.warning(i18n.t("mutations:requests.rejectAllSkipped"));
      }
    },
    onSettled: () => {
      invalidateRequestListQueries(utils);
      void utils.requests.getDetail.invalidate();
    },
  });
}
