import { trpc } from "@utils/trpc";
import { toast } from "sonner";

export default function useDeleteAll() {
  const utils = trpc.useUtils();

  return trpc.requests.deleteAll.useMutation({
    onMutate: async () => {
      await utils.requests.getAll.cancel();
      const previous = utils.requests.getAll.getData();
      utils.requests.getAll.setData(undefined, []);
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) utils.requests.getAll.setData(undefined, context.previous);
      toast.error("Failed to delete all requests");
    },
    onSuccess: (data) => toast.success(`Deleted ${data.deleted} request${data.deleted !== 1 ? "s" : ""}`),
    onSettled: () => utils.requests.getAll.invalidate(),
  });
}
