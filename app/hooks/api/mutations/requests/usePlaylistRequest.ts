import { errorToastDetailed } from "@modules/errors";
import { trpc } from "@utils/trpc";
import { notifyReclaimOutcome } from "@utils/request-helpers";

export function usePlaylistRequest() {
  const utils = trpc.useUtils();

  return trpc.requests.playlistRequest.useMutation({
    onError: (err) => errorToastDetailed(err, "requests.playlistDownloadFailed"),
    onSuccess: ({ outcome, data }) => {
      notifyReclaimOutcome({ outcome, label: "Playlist", itemName: data?.name ?? "Playlist" });
    },
    onSettled: () => utils.requests.getAll.invalidate(),
  });
}
