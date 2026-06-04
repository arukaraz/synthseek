import { toast } from "sonner";

import i18n from "@locale";
import { errorToast } from "@modules/errors";
import { trpc } from "@utils/trpc";

export function useUpdateListenBrainz() {
  const utils = trpc.useUtils();
  return trpc.discovery.updateListenBrainz.useMutation({
    onSuccess: () => {
      utils.discovery.getConfig.invalidate();
      toast.success(i18n.t("mutations:discovery.listenBrainzSaved"));
    },
    onError: (error) => errorToast(error, "discovery.listenBrainzFailed"),
  });
}
