import { errorToastDetailed } from "@modules/errors";
import { trpc } from "@utils/trpc";
import { notifyReclaimOutcome } from "@utils/request-helpers";

export function useBatchRequest() {
  const utils = trpc.useUtils();

  return trpc.requests.batchRequest.useMutation({
    onError: (err) => errorToastDetailed(err, "requests.albumDownloadFailed"),
    onSuccess: ({ outcome, data }) => {
      notifyReclaimOutcome({ outcome, label: "Album", itemName: data.name });
    },
    onSettled: () => {
      void utils.requests.getAll.invalidate();
      void utils.contentDetail.albumDetail.invalidate();
      void utils.contentDetail.artistTopTracks.invalidate();
      void utils.contentDetail.playlistDetail.invalidate();
    },
  });
}
