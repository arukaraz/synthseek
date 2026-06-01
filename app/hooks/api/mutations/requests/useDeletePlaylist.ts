import { trpc } from "@utils/trpc";
import { toast } from "sonner";

export function useDeletePlaylist() {
  const utils = trpc.useUtils();

  return trpc.requests.deletePlaylist.useMutation({
    onMutate: async ({ playlistId }) => {
      await utils.requests.getAll.cancel();
      const previous = utils.requests.getAll.getData();
      utils.requests.getAll.setData(undefined, (old) => old?.filter((item) => item.id !== playlistId));
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) utils.requests.getAll.setData(undefined, context.previous);
      toast.error("Failed to delete playlist");
    },
    onSuccess: () => toast.success("Playlist deleted"),
    onSettled: () => utils.requests.getAll.invalidate(),
  });
}
