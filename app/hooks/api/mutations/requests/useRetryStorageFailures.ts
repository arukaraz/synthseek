import { errorToast } from "@modules/errors";
import { notifyTracksRetried } from "@utils/request-helpers";
import { trpc } from "@utils/trpc";

export function useRetryStorageFailures() {
  const utils = trpc.useUtils();

  return trpc.requests.retryStorageFailures.useMutation({
    onError: (error) => errorToast(error, "requests.retryTrackFailed"),
    onSuccess: notifyTracksRetried,
    onSettled: () => {
      void utils.requests.getStorageFailureSummary.invalidate();
      void utils.requests.getAll.invalidate();
      void utils.library.getTracks.invalidate();
      void utils.library.getCounts.invalidate();
      void utils.contentDetail.albumDetail.invalidate();
      void utils.contentDetail.artistTopTracks.invalidate();
      void utils.contentDetail.playlistDetail.invalidate();
    },
  });
}
