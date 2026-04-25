import { trpc } from "@utils/trpc";
import { toast } from "sonner";

export function useLocalLogin() {
  const utils = trpc.useUtils();

  return trpc.auth.loginLocal.useMutation({
    onSuccess: () => {
      utils.auth.me.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Login failed");
    },
  });
}
