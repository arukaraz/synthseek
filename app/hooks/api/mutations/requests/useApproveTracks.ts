import type { inferRouterOutputs } from "@trpc/server";
import { toast } from "sonner";

import { RequestStatus, type AppRouter } from "@api/__generated__/types";
import i18n from "@locale";
import { errorToast } from "@modules/errors";
import { trpc } from "@utils/trpc";

type RequestsGetAllOutput = inferRouterOutputs<AppRouter>["requests"]["getAll"];

export function patchPendingApprovalTracks(
  items: RequestsGetAllOutput | undefined,
  trackIds: string[],
  nextStatus: RequestStatus
): RequestsGetAllOutput | undefined {
  if (!items) return items;
  const ids = new Set(trackIds);

  return items.map((item) => {
    const tracks = item.tracks.map((track) =>
      ids.has(track.id) && track.status === RequestStatus.enum.pending_approval
        ? { ...track, status: nextStatus }
        : track
    );
    const stillPending = tracks.some((track) => track.status === RequestStatus.enum.pending_approval);
    const status = item.status === RequestStatus.enum.pending_approval && !stillPending ? nextStatus : item.status;
    return { ...item, tracks, status };
  });
}

export function useApproveTracks() {
  const utils = trpc.useUtils();

  return trpc.requests.approve.useMutation({
    onMutate: async ({ trackIds }) => {
      await utils.requests.getAll.cancel();
      const previous = utils.requests.getAll.getData();

      utils.requests.getAll.setData(undefined, (old) =>
        patchPendingApprovalTracks(old, trackIds, RequestStatus.enum.queued)
      );

      return { previous };
    },
    onError: (err, _vars, context) => {
      if (context?.previous) utils.requests.getAll.setData(undefined, context.previous);
      errorToast(err, "requests.approveFailed");
    },
    onSuccess: ({ approved, skipped }) => {
      if (approved > 0) {
        toast.success(i18n.t("mutations:requests.tracksApproved", { count: approved }));
      } else if (skipped.length > 0) {
        toast.warning(i18n.t("mutations:requests.approveAllSkipped"));
      }
    },
    onSettled: () => utils.requests.getAll.invalidate(),
  });
}
