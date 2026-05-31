import { toast } from "sonner";

import { trpc } from "@utils/trpc";

export function useUpdateGeneral() {
  const utils = trpc.useUtils();
  return trpc.settings.updateGeneral.useMutation({
    onSuccess: () => {
      utils.settings.get.invalidate();
      utils.settings.getPublicConfig.invalidate();
      toast.success("Settings saved");
    },
    onError: (error) => toast.error(error.message || "Failed to save settings"),
  });
}
