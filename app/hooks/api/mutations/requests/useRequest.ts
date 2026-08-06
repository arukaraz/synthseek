import { errorToastDetailed } from "@modules/errors";
import { trpc } from "@utils/trpc";
import { notifyPendingApproval, notifyReclaimOutcome, notifyUpgradeOutcome } from "@utils/request-helpers";

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
    onSuccess: ({ outcome, data, pendingApproval }, vars, context) => {
      if (context) settleRequestDockJob(context.dockJobId, "complete", true);
      const itemName = `${data.artist} - ${data.track}`;
      if (pendingApproval) {
        notifyPendingApproval(itemName);
        return;
      }
      if (vars.config.upgrade === true) {
        notifyUpgradeOutcome({ outcome, itemName });
        return;
      }
      notifyReclaimOutcome({ outcome, kind: "download", itemName });
    },
    onSettled: () => {
      void utils.requests.getAll.invalidate();
      void utils.contentDetail.albumDetail.invalidate();
      void utils.contentDetail.artistTopTracks.invalidate();
      void utils.contentDetail.playlistDetail.invalidate();
    },
  });
}
