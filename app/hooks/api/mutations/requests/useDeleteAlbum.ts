import i18n from "@locale";
import { errorToast } from "@modules/errors";
import { trpc } from "@utils/trpc";
import { toast } from "sonner";

export function useDeleteAlbum() {
  const utils = trpc.useUtils();

  return trpc.requests.deleteAlbum.useMutation({
    onMutate: async ({ albumId }) => {
      await utils.requests.getAll.cancel();
      const previous = utils.requests.getAll.getData();
      utils.requests.getAll.setData(undefined, (old) => old?.filter((item) => item.id !== albumId));
      return { previous };
    },
    onError: (err, _vars, context) => {
      if (context?.previous) utils.requests.getAll.setData(undefined, context.previous);
      errorToast(err, "requests.deleteAlbumFailed");
    },
    onSuccess: () => toast.success(i18n.t("mutations:requests.albumDeleted")),
    onSettled: () => utils.requests.getAll.invalidate(),
  });
}
