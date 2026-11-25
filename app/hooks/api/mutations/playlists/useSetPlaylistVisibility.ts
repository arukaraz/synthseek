import i18n from "@locale";
import { errorToast } from "@modules/errors";
import { trpc } from "@utils/trpc";
import { toast } from "sonner";

import { invalidateRequestListQueries } from "../../queries/requests/requestListCache";

export function useSetPlaylistVisibility() {
  const utils = trpc.useUtils();

  return trpc.playlists.setVisibility.useMutation({
    onSuccess: ({ visibility }) => toast.success(i18n.t(`mutations:playlists.visibility.${visibility}`)),
    onError: (error) => errorToast(error, "playlists.visibilityFailed"),
    onSettled: () => {
      void utils.library.getPlaylists.invalidate();
      void utils.contentDetail.playlistDetail.invalidate();
      void utils.library.getCounts.invalidate();
      invalidateRequestListQueries(utils);
    },
  });
}
