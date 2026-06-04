import { toast } from "sonner";

import i18n from "@locale";
import { errorToast } from "@modules/errors";
import { trpc } from "@utils/trpc";

export function useDelegateArtist() {
  const utils = trpc.useUtils();

  return trpc.lidarr.delegateArtist.useMutation({
    onSuccess: () => {
      toast.success(i18n.t("mutations:requests.artistDelegated"));
      utils.requests.getAll.invalidate();
    },
    onError: (error) => errorToast(error, "requests.artistDelegateFailed"),
  });
}
