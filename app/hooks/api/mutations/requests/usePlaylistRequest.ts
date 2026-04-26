import { trpc } from "@utils/trpc";
import { notifyReclaimOutcome } from "@utils/request-helpers";
import { toast } from "sonner";

export default function usePlaylistRequest() {
  const utils = trpc.useUtils();

  return trpc.requests.playlistRequest.useMutation({
    onError: (err) => toast.error("Playlist download failed", { description: err.message }),
    onSuccess: ({ outcome, data }) => {
      notifyReclaimOutcome({ outcome, label: "Playlist", itemName: data?.name ?? "Playlist" });
    },
    onSettled: () => utils.requests.getAll.invalidate(),
  });
}
