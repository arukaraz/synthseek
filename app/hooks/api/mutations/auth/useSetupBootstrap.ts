import { trpc } from "@utils/trpc";
import { toast } from "sonner";

export function useSetupBootstrap() {
  const utils = trpc.useUtils();

  return trpc.auth.setupBootstrap.useMutation({
    onSuccess: () => {
      utils.auth.me.invalidate();
      utils.auth.setupRequired.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Setup failed");
    },
  });
}
