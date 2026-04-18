import { RequestStatus } from "@api/__generated__/types";
import { trpc } from "@utils/trpc";
import { toast } from "sonner";

export default function useRetryTrack() {
  const utils = trpc.useUtils();

  return trpc.requests.retryTrack.useMutation({
    onMutate: async ({ trackId }) => {
      await utils.requests.getAll.cancel();
      const previous = utils.requests.getAll.getData();

      utils.requests.getAll.setData(undefined, (old) =>
        old?.map((item) => ({
          ...item,
          tracks: item.tracks.map((t) =>
            t.id === trackId ? { ...t, status: RequestStatus.enum.queued, progress: 0, error: null } : t
          ),
        }))
      );

      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) utils.requests.getAll.setData(undefined, context.previous);
      toast.error("Failed to retry track");
    },
    onSuccess: () => toast.success("Track retry queued"),
    onSettled: () => utils.requests.getAll.invalidate(),
  });
}
