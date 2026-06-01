import { trpc } from "@utils/trpc";
import { toast } from "sonner";

export function useRetryAlbum() {
  const utils = trpc.useUtils();

  return trpc.requests.retryAlbum.useMutation({
    onError: () => toast.error("Failed to retry album"),
    onSuccess: () => toast.success("Album retry started"),
    onSettled: () => utils.requests.getAll.invalidate(),
  });
}
