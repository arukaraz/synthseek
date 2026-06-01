import { trpc } from "@utils/trpc";
import { notifyReclaimOutcome } from "@utils/request-helpers";
import { toast } from "sonner";

export function useBatchRequest() {
  const utils = trpc.useUtils();

  return trpc.requests.batchRequest.useMutation({
    onError: (err) => toast.error("Album download failed", { description: err.message }),
    onSuccess: ({ outcome, data }) => {
      notifyReclaimOutcome({ outcome, label: "Album", itemName: data.name });
    },
    onSettled: () => utils.requests.getAll.invalidate(),
  });
}
