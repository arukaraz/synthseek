import { trpc } from "@utils/trpc";
import { toast } from "sonner";

export default function useDeleteAlbum() {
  const utils = trpc.useUtils();

  return trpc.requests.deleteAlbum.useMutation({
    onMutate: async ({ albumId }) => {
      await utils.requests.getAll.cancel();
      const previous = utils.requests.getAll.getData();
      utils.requests.getAll.setData(undefined, (old) => old?.filter((item) => item.id !== albumId));
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) utils.requests.getAll.setData(undefined, context.previous);
      toast.error("Failed to delete album");
    },
    onSuccess: () => toast.success("Album deleted"),
    onSettled: () => utils.requests.getAll.invalidate(),
  });
}
