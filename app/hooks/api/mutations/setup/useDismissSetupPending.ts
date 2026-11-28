import { errorToast } from "@modules/errors";
import { trpc } from "@utils/trpc";

export function useDismissSetupPending() {
  const utils = trpc.useUtils();

  return trpc.settings.setup.dismissPending.useMutation({
    onSuccess: (pending) => {
      utils.settings.setup.pending.setData(undefined, pending);
    },
    onError: (error) => errorToast(error, "settings.dismissSetupFailed"),
  });
}
