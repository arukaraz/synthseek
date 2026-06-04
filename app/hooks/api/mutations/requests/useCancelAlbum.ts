import { RequestStatus } from "@api/__generated__/types";
import i18n from "@locale";
import { errorToast } from "@modules/errors";
import { trpc } from "@utils/trpc";
import { toast } from "sonner";

export function useCancelAlbum() {
  const utils = trpc.useUtils();

  return trpc.requests.cancelAlbum.useMutation({
    onMutate: async ({ albumId }) => {
      await utils.requests.getAll.cancel();
      const previous = utils.requests.getAll.getData();

      utils.requests.getAll.setData(undefined, (old) =>
        old?.map((item) => {
          if (item.id !== albumId) return item;
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
    onError: (err, _vars, context) => {
      if (context?.previous) utils.requests.getAll.setData(undefined, context.previous);
      errorToast(err, "requests.cancelAlbumFailed");
    },
    onSuccess: () => toast.success(i18n.t("mutations:requests.albumCancelled")),
    onSettled: () => utils.requests.getAll.invalidate(),
  });
}
