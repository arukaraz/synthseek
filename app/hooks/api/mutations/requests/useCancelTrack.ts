import { RequestStatus } from "@api/__generated__/types";
import { trpc } from "@utils/trpc";
import { toast } from "sonner";

export default function useCancelTrack() {
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
    onError: (_err, _vars, context) => {
      if (context?.previous) utils.requests.getAll.setData(undefined, context.previous);
      toast.error("Failed to cancel track");
    },
    onSuccess: () => toast.success("Track cancelled"),
    onSettled: () => utils.requests.getAll.invalidate(),
  });
}
