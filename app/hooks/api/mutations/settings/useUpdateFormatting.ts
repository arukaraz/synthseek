import { toast } from "sonner";

import { trpc } from "@utils/trpc";

export function useUpdateFormatting() {
  const utils = trpc.useUtils();
  return trpc.settings.updateFormatting.useMutation({
    onSuccess: () => {
      utils.settings.get.invalidate();
      toast.success("Formatting saved");
    },
    onError: (error) => toast.error(error.message || "Failed to save formatting"),
  });
}
