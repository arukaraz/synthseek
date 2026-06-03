import { trpc } from "@utils/trpc";
import { toast } from "sonner";

export function useSetupBootstrap() {
  const utils = trpc.useUtils();

  return trpc.auth.setupBootstrap.useMutation({
    onSuccess: (user) => {
      utils.auth.me.setData(undefined, user);
      utils.auth.setupRequired.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Setup failed");
    },
  });
}
