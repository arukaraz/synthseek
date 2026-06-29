import i18n from "@locale";
import { errorToastDetailed } from "@modules/errors";
import { trpc } from "@utils/trpc";
import { notifyReclaimOutcome } from "@utils/request-helpers";

import { correlateRequestDockJob, seedRequestDockJob, settleRequestDockJob } from "@hooks/api/subscriptions";

export function usePlaylistRequest() {
  const utils = trpc.useUtils();

  return trpc.requests.playlistRequest.useMutation({
    onMutate: ({ name, total_tracks }) => {
      const dockJobId = seedRequestDockJob({ name, trackCount: total_tracks });
      return { dockJobId };
    },
    onError: (err, _vars, context) => {
      if (context) settleRequestDockJob(context.dockJobId, "failed", false);
      errorToastDetailed(err, "requests.playlistDownloadFailed");
    },
    onSuccess: ({ outcome, requestId, data }, _vars, context) => {
      if (context) {
        if (outcome === "created") correlateRequestDockJob(context.dockJobId, requestId);
        else settleRequestDockJob(context.dockJobId, "complete", false);
      }
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
