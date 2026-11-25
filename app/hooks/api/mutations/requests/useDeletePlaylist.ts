import i18n from "@locale";
import { errorToast } from "@modules/errors";
import { useQueryClient } from "@tanstack/react-query";
import { trpc } from "@utils/trpc";
import { toast } from "sonner";

import {
  cancelRequestList,
  invalidateRequestListQueries,
  removeRequestListItem,
  restoreRequestList,
  snapshotRequestList,
} from "../../queries/requests/requestListCache";

export function useDeletePlaylist() {
  const utils = trpc.useUtils();
  const queryClient = useQueryClient();

  return trpc.requests.deletePlaylist.useMutation({
    onMutate: async ({ playlistId }) => {
      await cancelRequestList(queryClient);
      const previous = snapshotRequestList(queryClient);
      removeRequestListItem(queryClient, playlistId);
      return { previous };
    },
    onError: (err, _vars, context) => {
      if (context) restoreRequestList(queryClient, context.previous);
      errorToast(err, "requests.deletePlaylistFailed");
    },
    onSuccess: () => toast.success(i18n.t("mutations:requests.playlistDeleted")),
    onSettled: () => invalidateRequestListQueries(utils),
  });
}
