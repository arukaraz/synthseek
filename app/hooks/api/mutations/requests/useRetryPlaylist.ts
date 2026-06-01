import { trpc } from "@utils/trpc";
import { toast } from "sonner";

export function useRetryPlaylist() {
  const utils = trpc.useUtils();

  return trpc.requests.retryPlaylist.useMutation({
    onError: () => toast.error("Failed to retry playlist"),
    onSuccess: () => toast.success("Playlist retry started"),
    onSettled: () => utils.requests.getAll.invalidate(),
  });
}
