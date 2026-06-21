import i18n from "@locale";
import { errorToastDetailed } from "@modules/errors";
import { trpc } from "@utils/trpc";
import { notifyReclaimOutcome } from "@utils/request-helpers";

export function usePlaylistRequest() {
  const utils = trpc.useUtils();

  return trpc.requests.playlistRequest.useMutation({
    onError: (err) => errorToastDetailed(err, "requests.playlistDownloadFailed"),
    onSuccess: ({ outcome, data }) => {
      notifyReclaimOutcome({
        outcome,
        kind: "playlist",
        itemName: data?.name ?? i18n.t("mutations:requests.reclaim.playlist"),
      });
    },
    onSettled: () => {
      void utils.requests.getAll.invalidate();
      void utils.contentDetail.playlistDetail.invalidate();
    },
  });
}
