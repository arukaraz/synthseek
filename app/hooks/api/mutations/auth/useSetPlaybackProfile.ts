import { toast } from "sonner";

import i18n from "@locale";
import { trpc } from "@utils/trpc";

export function useSetPlaybackProfile() {
  const utils = trpc.useUtils();
  return trpc.auth.updateProfile.useMutation({
    onSuccess: (user) => {
      utils.auth.me.setData(undefined, user);
    },
    onError: () => toast.error(i18n.t("player:settings.updateFailed")),
  });
}
