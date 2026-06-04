import { errorToast } from "@modules/errors";
import { trpc } from "@utils/trpc";
import { toast } from "sonner";

export function useClearCompleted() {
  const utils = trpc.useUtils();

  return trpc.requests.clearCompleted.useMutation({
    onError: (error) => errorToast(error, "requests.clearCompletedFailed"),
    onSuccess: (data) => toast.success(`Cleared ${data.count} completed requests`),
    onSettled: () => utils.requests.getAll.invalidate(),
  });
}
