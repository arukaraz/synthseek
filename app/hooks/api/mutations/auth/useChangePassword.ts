import { toast } from "sonner";

import i18n from "@locale";
import { errorToast } from "@modules/errors";
import { trpc } from "@utils/trpc";

export function useChangePassword() {
  return trpc.auth.changePassword.useMutation({
    onSuccess: () => toast.success(i18n.t("mutations:auth.passwordChanged")),
    onError: (error) => errorToast(error, "auth.changePasswordFailed"),
  });
}
