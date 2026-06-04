import { toast } from "sonner";

import i18n from "@locale";
import { trpc } from "@utils/trpc";

export function useSetLanguage() {
  const utils = trpc.useUtils();
  return trpc.auth.updateProfile.useMutation({
    onSuccess: async (user) => {
      utils.auth.me.setData(undefined, user);
      await i18n.changeLanguage(user.language);
      toast.success(i18n.t("settings:general.language.updated"));
    },
    onError: () => toast.error(i18n.t("settings:general.language.updateFailed")),
  });
}
