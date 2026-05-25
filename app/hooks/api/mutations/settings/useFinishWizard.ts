import { toast } from "sonner";

import { trpc } from "@utils/trpc";

export function useFinishWizard() {
  const utils = trpc.useUtils();
  return trpc.settings.finishWizard.useMutation({
    onSuccess: () => {
      utils.auth.setupRequired.invalidate();
    },
    onError: (error) => toast.error(error.message || "Could not finish setup"),
  });
}
