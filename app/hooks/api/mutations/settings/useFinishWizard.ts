import { errorToast } from "@modules/errors";
import { trpc } from "@utils/trpc";

export function useFinishWizard() {
  const utils = trpc.useUtils();
  return trpc.settings.finishWizard.useMutation({
    onSuccess: () => {
      utils.auth.setupRequired.setData(undefined, false);
      utils.auth.setupRequired.invalidate();
    },
    onError: (error) => errorToast(error, "settings.finishWizardFailed"),
  });
}
