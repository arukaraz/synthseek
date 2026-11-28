import { toast } from "sonner";

import i18n from "@locale";
import { errorToast } from "@modules/errors";
import { trpc } from "@utils/trpc";

export function useUpdateConnectionsOidc() {
  const utils = trpc.useUtils();
  return trpc.settings.updateConnectionsOidc.useMutation({
    onSuccess: () => {
      void utils.settings.get.invalidate();
      void utils.settings.oidcSignInMode.invalidate();
      void utils.auth.signInMethods.invalidate();
      toast.success(i18n.t("mutations:settings.oidcSaved"));
    },
    onError: (error) => errorToast(error, "settings.oidcFailed"),
  });
}

export function useTestOidc() {
  const utils = trpc.useUtils();
  return trpc.settings.testOidc.useMutation({
    onSettled: () => {
      void utils.settings.get.invalidate();
      void utils.settings.oidcSignInMode.invalidate();
    },
    onError: (error) => errorToast(error, "settings.oidcTestFailed"),
  });
}

export function useUpdateOidcSignInMode() {
  const utils = trpc.useUtils();
  return trpc.settings.updateOidcSignInMode.useMutation({
    onSuccess: (mode) => {
      utils.settings.oidcSignInMode.setData(undefined, mode);
      void utils.settings.get.invalidate();
      void utils.auth.signInMethods.invalidate();
      toast.success(i18n.t("mutations:settings.oidcSignInModeSaved"));
    },
    onError: (error) => {
      void utils.settings.oidcSignInMode.invalidate();
      errorToast(error, "settings.oidcSignInModeFailed");
    },
  });
}

export function useUpdateAccountProvisioning() {
  const utils = trpc.useUtils();
  return trpc.settings.updateAccountProvisioning.useMutation({
    onSuccess: () => {
      void utils.settings.get.invalidate();
      void utils.auth.signInMethods.invalidate();
      toast.success(i18n.t("mutations:settings.accountProvisioningSaved"));
    },
    onError: (error) => errorToast(error, "settings.accountProvisioningFailed"),
  });
}
