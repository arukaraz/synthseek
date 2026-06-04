import { toast } from "sonner";

import i18n from "@locale";
import { errorToast } from "@modules/errors";
import { trpc } from "@utils/trpc";

export function useRevokeApiKey() {
  const utils = trpc.useUtils();
  return trpc.apiKeys.revoke.useMutation({
    onSuccess: () => {
      utils.apiKeys.list.invalidate();
      toast.success(i18n.t("mutations:apiKeys.revoked"));
    },
    onError: (error) => errorToast(error, "apiKeys.revokeFailed"),
  });
}
