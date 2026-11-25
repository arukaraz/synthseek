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

export function useDeleteAlbum() {
  const utils = trpc.useUtils();
  const queryClient = useQueryClient();

  return trpc.requests.deleteAlbum.useMutation({
    onMutate: async ({ albumId }) => {
      await cancelRequestList(queryClient);
      const previous = snapshotRequestList(queryClient);
      removeRequestListItem(queryClient, albumId);
      return { previous };
    },
    onError: (err, _vars, context) => {
      if (context) restoreRequestList(queryClient, context.previous);
      errorToast(err, "requests.deleteAlbumFailed");
    },
    onSuccess: () => toast.success(i18n.t("mutations:requests.albumDeleted")),
    onSettled: () => invalidateRequestListQueries(utils),
  });
}
