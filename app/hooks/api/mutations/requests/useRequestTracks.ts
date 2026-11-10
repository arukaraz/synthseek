import { errorToastDetailed } from "@modules/errors";
import { trpc } from "@utils/trpc";
import { notifyTracksRequested } from "@utils/request-helpers";

import { failRequestDockJob, seedRequestDockJob, settleRequestDockJob } from "@hooks/api/subscriptions";

export function useRequestTracks(itemNameOf: () => string) {
  const utils = trpc.useUtils();

  return trpc.requests.requestTracks.useMutation({
    onMutate: ({ tracks }) => {
      const itemName = itemNameOf();
      const dockJobId = seedRequestDockJob({ name: itemName, trackCount: tracks.length });
      return { dockJobId, itemName };
    },
    onError: (err, _vars, context) => {
      if (context) failRequestDockJob(context.dockJobId, err, true);
      errorToastDetailed(err, "requests.tracksRequestFailed");
    },
    onSuccess: (result, _vars, context) => {
      if (context) settleRequestDockJob(context.dockJobId, result.failed > 0 ? "failed" : "complete", true);
      notifyTracksRequested(result, context?.itemName ?? itemNameOf());
    },
    onSettled: () => {
      void utils.requests.getAll.invalidate();
      void utils.requestPreset.mine.invalidate();
      void utils.contentDetail.albumDetail.invalidate();
      void utils.contentDetail.artistTopTracks.invalidate();
      void utils.contentDetail.playlistDetail.invalidate();
    },
  });
}
