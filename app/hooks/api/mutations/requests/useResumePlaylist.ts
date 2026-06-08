import { RequestStatus } from "@api/__generated__/types";
import i18n from "@locale";
import { errorToast } from "@modules/errors";
import { trpc } from "@utils/trpc";
import { toast } from "sonner";

export function useResumePlaylist() {
  const utils = trpc.useUtils();

  return trpc.requests.resumePlaylist.useMutation({
    onMutate: async ({ playlistId }) => {
      await utils.requests.getAll.cancel();
      const previous = utils.requests.getAll.getData();

      utils.requests.getAll.setData(undefined, (old) =>
        old?.map((item) => {
          if (item.id !== playlistId) return item;
          return {
            ...item,
            status: RequestStatus.enum.queued,
            tracks: item.tracks.map((t) =>
              t.status === RequestStatus.enum.paused ? { ...t, status: RequestStatus.enum.queued, progress: 0 } : t
            ),
          };
        })
      );

      return { previous };
    },
    onError: (err, _vars, context) => {
      if (context?.previous) utils.requests.getAll.setData(undefined, context.previous);
      errorToast(err, "requests.resumePlaylistFailed");
    },
    onSuccess: () => toast.success(i18n.t("mutations:requests.playlistResumed")),
    onSettled: () => utils.requests.getAll.invalidate(),
  });
}
