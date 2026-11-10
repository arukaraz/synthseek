import i18n from "@locale";
import { errorToastDetailed } from "@modules/errors";
import { trpc } from "@utils/trpc";
import { notifyReclaimOutcome } from "@utils/request-helpers";

import {
  correlateRequestDockJob,
  failRequestDockJob,
  seedRequestDockJob,
  settleRequestDockJob,
} from "@hooks/api/subscriptions";

export function usePlaylistRequest() {
  const utils = trpc.useUtils();

  return trpc.requests.playlistRequest.useMutation({
    onMutate: ({ name, total_tracks }) => {
      const dockJobId = seedRequestDockJob({ name, trackCount: total_tracks });
      return { dockJobId };
    },
    onError: (err, _vars, context) => {
      if (context) failRequestDockJob(context.dockJobId, err, false);
      errorToastDetailed(err, "requests.playlistDownloadFailed");
    },
    onSuccess: (result, _vars, context) => {
      if (context) {
        if (result.outcome === "created") correlateRequestDockJob(context.dockJobId, result.requestId);
        else settleRequestDockJob(context.dockJobId, "complete", false);
      }
      notifyReclaimOutcome({
        outcome: result.outcome,
        kind: "playlist",
        itemName: result.data?.name || i18n.t("mutations:requests.reclaim.playlist"),
      });
    },
    onSettled: () => {
      void utils.requests.getAll.invalidate();
      void utils.requestPreset.mine.invalidate();
      void utils.contentDetail.playlistDetail.invalidate();
    },
  });
}
