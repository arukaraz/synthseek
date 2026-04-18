import { trpc } from "@utils/trpc";
import { toast } from "sonner";

export default function useCreateTrack() {
  const utils = trpc.useUtils();

  return trpc.requests.createTrack.useMutation({
    onError: (err) => toast.error(`Failed to add request: ${err.message}`),
    onSuccess: () => toast.success("Track added to queue"),
    onSettled: () => utils.requests.getAll.invalidate(),
  });
}
