import { toast } from "sonner";

import i18n from "@locale";
import { errorToast } from "@modules/errors";
import { trpc } from "@utils/trpc";

export function useRevokeSubsonicCredential() {
  const utils = trpc.useUtils();

  return trpc.subsonic.revokeCredential.useMutation({
    onSuccess: () => {
      utils.subsonic.listCredentials.invalidate();
      utils.subsonic.status.invalidate();
      toast.success(i18n.t("mutations:subsonic.revoked"));
    },
    onError: (error) => errorToast(error, "subsonic.revokeFailed"),
  });
}
