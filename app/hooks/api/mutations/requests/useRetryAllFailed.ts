import { trpc } from "@utils/trpc";
import { toast } from "sonner";

export default function useRetryAllFailed() {
  const utils = trpc.useUtils();

  return trpc.requests.retryAllFailed.useMutation({
    onError: () => toast.error("Failed to retry requests"),
    onSuccess: (data) => {
      if (data.retried > 0) {
        toast.success(`Retrying ${data.retried} request${data.retried !== 1 ? "s" : ""}`);
      } else {
        toast.info("No failed requests to retry");
      }
    },
    onSettled: () => utils.requests.getAll.invalidate(),
  });
}
