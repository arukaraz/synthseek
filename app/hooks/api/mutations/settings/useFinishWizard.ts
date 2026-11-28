import { errorToast } from "@modules/errors";
import { trpc } from "@utils/trpc";

import type { FeedbackOptions } from "./types";

export function useFinishWizard({ silent = false }: FeedbackOptions = {}) {
  const utils = trpc.useUtils();
  return trpc.settings.finishWizard.useMutation({
    onSuccess: () => {
      utils.auth.setupRequired.setData(undefined, { required: false, tokenRequired: false });
      utils.auth.setupRequired.invalidate();
    },
    onError: (error) => {
      if (!silent) errorToast(error, "settings.finishWizardFailed");
    },
  });
}
