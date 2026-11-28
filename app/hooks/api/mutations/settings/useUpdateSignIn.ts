import { toast } from "sonner";

import i18n from "@locale";
import { errorToast } from "@modules/errors";
import { trpc } from "@utils/trpc";

export function useUpdateSignIn() {
  const utils = trpc.useUtils();
  return trpc.settings.updateSignIn.useMutation({
    onSuccess: () => {
      void utils.settings.get.invalidate();
      void utils.auth.signInMethods.invalidate();
      toast.success(i18n.t("mutations:settings.signInSaved"));
    },
    onError: (error) => errorToast(error, "settings.signInFailed"),
  });
}
