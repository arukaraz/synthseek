import { trpc } from "@utils/trpc";
import { toast } from "sonner";

export default function useBatchRequest() {
  const utils = trpc.useUtils();

  return trpc.requests.batchRequest.useMutation({
    onError: (err) => toast.error(`Failed to add album: ${err.message}`),
    onSuccess: (data) => toast.success(`Album "${data.name}" added with ${data.total_tracks} tracks`),
    onSettled: () => utils.requests.getAll.invalidate(),
  });
}
