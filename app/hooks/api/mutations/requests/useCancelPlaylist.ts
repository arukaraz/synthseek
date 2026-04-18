import { RequestStatus } from "@api/__generated__/types";
import { trpc } from "@utils/trpc";
import { toast } from "sonner";

export default function useCancelPlaylist() {
  const utils = trpc.useUtils();

  return trpc.requests.cancelPlaylist.useMutation({
    onMutate: async ({ playlistId }) => {
      await utils.requests.getAll.cancel();
      const previous = utils.requests.getAll.getData();

      utils.requests.getAll.setData(undefined, (old) =>
        old?.map((item) => {
          if (item.id !== playlistId) return item;
          return {
            ...item,
            status: RequestStatus.enum.cancelled,
            tracks: item.tracks.map((t) =>
              t.status !== RequestStatus.enum.complete &&
              t.status !== RequestStatus.enum.failed &&
              t.status !== RequestStatus.enum.cancelled
                ? { ...t, status: RequestStatus.enum.cancelled, progress: 0 }
                : t
            ),
          };
        })
      );

      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) utils.requests.getAll.setData(undefined, context.previous);
      toast.error("Failed to cancel playlist");
    },
    onSuccess: () => toast.success("Playlist cancelled"),
    onSettled: () => utils.requests.getAll.invalidate(),
  });
}
