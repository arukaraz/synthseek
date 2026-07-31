import { errorToastDetailed } from "@modules/errors";
import { trpc } from "@utils/trpc";
import { notifyPendingApproval, notifyReclaimOutcome } from "@utils/request-helpers";

import { seedRequestDockJob, settleRequestDockJob } from "@hooks/api/subscriptions";

export function useRequest() {
  const utils = trpc.useUtils();

  return trpc.requests.request.useMutation({
    onMutate: ({ track }) => {
      const dockJobId = seedRequestDockJob({
        name: track.artist ? `${track.artist} - ${track.title}` : track.title,
        trackCount: 1,
      });
      return { dockJobId };
    },
    onError: (err, _vars, context) => {
      if (context) settleRequestDockJob(context.dockJobId, "failed", true);
      errorToastDetailed(err, "requests.downloadFailed");
    },
    onSuccess: ({ outcome, data, pendingApproval }, _vars, context) => {
      if (context) settleRequestDockJob(context.dockJobId, "complete", true);
      if (pendingApproval) {
        notifyPendingApproval(`${data.artist} - ${data.track}`);
        return;
      }
      notifyReclaimOutcome({ outcome, kind: "download", itemName: `${data.artist} - ${data.track}` });
    },
    onSettled: () => {
      void utils.requests.getAll.invalidate();
      void utils.contentDetail.albumDetail.invalidate();
      void utils.contentDetail.artistTopTracks.invalidate();
      void utils.contentDetail.playlistDetail.invalidate();
    },
  });
}
