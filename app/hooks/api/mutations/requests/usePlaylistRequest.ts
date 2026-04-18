import { trpc } from "@utils/trpc";
import { toast } from "sonner";

export default function usePlaylistRequest() {
  const utils = trpc.useUtils();

  return trpc.requests.playlistRequest.useMutation({
    onError: (err) => toast.error(`Failed to add playlist: ${err.message}`),
    onSettled: () => utils.requests.getAll.invalidate(),
  });
}
