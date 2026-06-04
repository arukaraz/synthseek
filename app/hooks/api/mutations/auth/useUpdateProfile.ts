import { toast } from "sonner";

import i18n from "@locale";
import { errorToast } from "@modules/errors";
import { trpc } from "@utils/trpc";

export function useUpdateProfile() {
  const utils = trpc.useUtils();
  return trpc.auth.updateProfile.useMutation({
    onSuccess: (user) => {
      utils.auth.me.setData(undefined, user);
      utils.auth.me.invalidate();
      toast.success(i18n.t("mutations:auth.profileUpdated"));
    },
    onError: (error) => errorToast(error, "auth.updateProfileFailed"),
  });
}
