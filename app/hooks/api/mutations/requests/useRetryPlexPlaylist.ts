import { trpc } from "@utils/trpc";
import { toast } from "sonner";

export default function useRetryPlexPlaylist() {
  return trpc.requests.retryPlexPlaylist.useMutation({
    onError: () => toast.error("Failed to sync playlist to Plex"),
    onSuccess: () => toast.success("Playlist synced to Plex"),
  });
}
