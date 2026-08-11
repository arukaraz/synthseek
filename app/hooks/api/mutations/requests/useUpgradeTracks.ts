import { errorToast } from "@modules/errors";
import { notifyBulkUpgradeOutcome } from "@utils/request-helpers";
import { trpc } from "@utils/trpc";

export const MAX_BULK_UPGRADE_TRACKS = 500;

export function useUpgradeTracks() {
  const utils = trpc.useUtils();

  return trpc.requests.upgradeTracks.useMutation({
    onError: (error) => errorToast(error, "requests.upgradeTracksFailed"),
    onSuccess: ({ results }) => notifyBulkUpgradeOutcome(results),
    onSettled: () => {
      void utils.requests.getAll.invalidate();
      void utils.library.getTracks.invalidate();
      void utils.library.getCounts.invalidate();
      void utils.contentDetail.albumDetail.invalidate();
      void utils.contentDetail.artistTopTracks.invalidate();
      void utils.contentDetail.playlistDetail.invalidate();
    },
  });
}
