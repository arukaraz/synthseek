import { trpc } from "@utils/trpc";
import { toast } from "sonner";

export function useLocalLogin() {
  const utils = trpc.useUtils();

  return trpc.auth.loginLocal.useMutation({
    onSuccess: (user) => {
      utils.auth.me.setData(undefined, user);
    },
    onError: (error) => {
      toast.error(error.message || "Login failed");
    },
  });
}
