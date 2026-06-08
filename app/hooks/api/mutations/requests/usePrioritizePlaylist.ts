import { RequestStatus } from "@api/__generated__/types";
import i18n from "@locale";
import { errorToast } from "@modules/errors";
import { trpc } from "@utils/trpc";
import { toast } from "sonner";

export function usePrioritizePlaylist() {
  const utils = trpc.useUtils();

  return trpc.requests.prioritizePlaylist.useMutation({
    onMutate: async ({ playlistId }) => {
      await utils.requests.getAll.cancel();
      const previous = utils.requests.getAll.getData();

      utils.requests.getAll.setData(undefined, (old) =>
        old?.map((item) => {
          if (item.id !== playlistId) return item;
          return {
            ...item,
            tracks: item.tracks.map((t) =>
              t.status === RequestStatus.enum.queued && t.priority === 0 ? { ...t, priority: 1 } : t
            ),
          };
        })
      );

      return { previous };
    },
    onError: (err, _vars, context) => {
      if (context?.previous) utils.requests.getAll.setData(undefined, context.previous);
      errorToast(err, "requests.prioritizePlaylistFailed");
    },
    onSuccess: () => toast.success(i18n.t("mutations:requests.playlistPrioritized")),
    onSettled: () => utils.requests.getAll.invalidate(),
  });
}
