import { errorToastDetailed } from "@modules/errors";
import { trpc } from "@utils/trpc";
import { notifyReclaimOutcome } from "@utils/request-helpers";

import { seedRequestDockJob, settleRequestDockJob } from "@hooks/api/subscriptions";

export function useBatchRequest() {
  const utils = trpc.useUtils();

  return trpc.requests.batchRequest.useMutation({
    onMutate: ({ name, artist, tracks }) => {
      const dockJobId = seedRequestDockJob({
        name: artist ? `${artist} - ${name}` : name,
        trackCount: tracks.length,
      });
      return { dockJobId };
    },
    onError: (err, _vars, context) => {
      if (context) settleRequestDockJob(context.dockJobId, "failed", true);
      errorToastDetailed(err, "requests.albumDownloadFailed");
    },
    onSuccess: ({ outcome, data }, _vars, context) => {
      if (context) settleRequestDockJob(context.dockJobId, "complete", true);
      notifyReclaimOutcome({ outcome, kind: "album", itemName: data.name });
    },
    onSettled: () => {
      void utils.requests.getAll.invalidate();
      void utils.contentDetail.albumDetail.invalidate();
      void utils.contentDetail.artistTopTracks.invalidate();
      void utils.contentDetail.playlistDetail.invalidate();
    },
  });
}
