import { RequestStatus } from "@api/__generated__/types";
import i18n from "@locale";
import { errorToast } from "@modules/errors";
import { trpc } from "@utils/trpc";
import { toast } from "sonner";

export function useCancelTrack() {
  const utils = trpc.useUtils();

  return trpc.requests.cancelTrack.useMutation({
    onMutate: async ({ trackId }) => {
      await utils.requests.getAll.cancel();
      const previous = utils.requests.getAll.getData();

      utils.requests.getAll.setData(undefined, (old) =>
        old?.map((item) => ({
          ...item,
          tracks: item.tracks.map((t) =>
            t.id === trackId ? { ...t, status: RequestStatus.enum.cancelled, progress: 0 } : t
          ),
        }))
      );

      return { previous };
    },
    onError: (err, _vars, context) => {
      if (context?.previous) utils.requests.getAll.setData(undefined, context.previous);
      errorToast(err, "requests.cancelTrackFailed");
    },
    onSuccess: () => toast.success(i18n.t("mutations:requests.trackCancelled")),
    onSettled: () => utils.requests.getAll.invalidate(),
  });
}
