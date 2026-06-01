import { trpc } from "@utils/trpc";
import { notifyReclaimOutcome } from "@utils/request-helpers";
import { toast } from "sonner";

export function useRequest() {
  const utils = trpc.useUtils();

  return trpc.requests.request.useMutation({
    onError: (err) => toast.error("Download failed", { description: err.message }),
    onSuccess: ({ outcome, data }) => {
      notifyReclaimOutcome({ outcome, label: "Download", itemName: `${data.artist} - ${data.track}` });
    },
    onSettled: () => utils.requests.getAll.invalidate(),
  });
}
