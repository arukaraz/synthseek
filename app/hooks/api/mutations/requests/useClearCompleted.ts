import { trpc } from "@utils/trpc";
import { toast } from "sonner";

export function useClearCompleted() {
  const utils = trpc.useUtils();

  return trpc.requests.clearCompleted.useMutation({
    onError: () => toast.error("Failed to clear completed requests"),
    onSuccess: (data) => toast.success(`Cleared ${data.count} completed requests`),
    onSettled: () => utils.requests.getAll.invalidate(),
  });
}
