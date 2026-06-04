import { toast } from "sonner";

import i18n from "@locale";
import { errorToast } from "@modules/errors";
import { trpc } from "@utils/trpc";

export function useUpdateLastfm() {
  const utils = trpc.useUtils();
  return trpc.discovery.updateLastfm.useMutation({
    onSuccess: () => {
      utils.discovery.getConfig.invalidate();
      toast.success(i18n.t("mutations:discovery.lastfmSaved"));
    },
    onError: (error) => errorToast(error, "discovery.lastfmFailed"),
  });
}
