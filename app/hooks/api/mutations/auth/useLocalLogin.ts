import { errorToast } from "@modules/errors";
import { trpc } from "@utils/trpc";

export function useLocalLogin() {
  const utils = trpc.useUtils();

  return trpc.auth.loginLocal.useMutation({
    onSuccess: (user) => {
      utils.auth.me.setData(undefined, user);
    },
    onError: (error) => {
      errorToast(error, "auth.loginFailed");
    },
  });
}
