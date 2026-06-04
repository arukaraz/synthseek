import { errorToast } from "@modules/errors";
import { trpc } from "@utils/trpc";

export function useSetupBootstrap() {
  const utils = trpc.useUtils();

  return trpc.auth.setupBootstrap.useMutation({
    onSuccess: (user) => {
      utils.auth.me.setData(undefined, user);
      utils.auth.setupRequired.invalidate();
    },
    onError: (error) => {
      errorToast(error, "auth.setupFailed");
    },
  });
}
