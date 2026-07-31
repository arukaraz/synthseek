import { toast } from "sonner";

import { RequestStatus } from "@api/__generated__/types";
import i18n from "@locale";
import { errorToast } from "@modules/errors";
import { trpc } from "@utils/trpc";

import { patchPendingApprovalTracks } from "./useApproveTracks";

export function useRejectTracks() {
  const utils = trpc.useUtils();

  return trpc.requests.reject.useMutation({
    onMutate: async ({ trackIds }) => {
      await utils.requests.getAll.cancel();
      const previous = utils.requests.getAll.getData();

      utils.requests.getAll.setData(undefined, (old) =>
        patchPendingApprovalTracks(old, trackIds, RequestStatus.enum.cancelled)
      );

      return { previous };
    },
    onError: (err, _vars, context) => {
      if (context?.previous) utils.requests.getAll.setData(undefined, context.previous);
      errorToast(err, "requests.rejectFailed");
    },
    onSuccess: ({ rejected, skipped }) => {
      if (rejected > 0) {
        toast.success(i18n.t("mutations:requests.tracksRejected", { count: rejected }));
      } else if (skipped.length > 0) {
        toast.warning(i18n.t("mutations:requests.rejectAllSkipped"));
      }
    },
    onSettled: () => utils.requests.getAll.invalidate(),
  });
}
