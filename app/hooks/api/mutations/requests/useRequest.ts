import { errorToastDetailed } from "@modules/errors";
import { trpc } from "@utils/trpc";
import { notifyReclaimOutcome } from "@utils/request-helpers";

export function useRequest() {
  const utils = trpc.useUtils();

  return trpc.requests.request.useMutation({
    onError: (err) => errorToastDetailed(err, "requests.downloadFailed"),
    onSuccess: ({ outcome, data }) => {
      notifyReclaimOutcome({ outcome, label: "Download", itemName: `${data.artist} - ${data.track}` });
    },
    onSettled: () => {
      void utils.requests.getAll.invalidate();
      void utils.contentDetail.albumDetail.invalidate();
      void utils.contentDetail.artistTopTracks.invalidate();
      void utils.contentDetail.playlistDetail.invalidate();
    },
  });
}
