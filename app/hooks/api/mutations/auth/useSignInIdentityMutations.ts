import { toast } from "sonner";

import i18n from "@locale";
import { errorToast } from "@modules/errors";
import { trpc } from "@utils/trpc";

export function useLinkJellyfin() {
  const utils = trpc.useUtils();
  return trpc.auth.linkJellyfin.useMutation({
    onSuccess: (identities) => {
      utils.auth.signInIdentities.setData(undefined, identities);
      void utils.auth.me.invalidate();
      toast.success(i18n.t("mutations:auth.jellyfinLinked"));
    },
    onError: (error) => errorToast(error, "auth.jellyfinLinkFailed"),
  });
}

export function useUnlinkIdentity() {
  const utils = trpc.useUtils();
  return trpc.auth.unlinkIdentity.useMutation({
    onSuccess: (identities) => {
      utils.auth.signInIdentities.setData(undefined, identities);
      void utils.auth.me.invalidate();
      toast.success(i18n.t("mutations:auth.identityUnlinked"));
    },
    onError: (error) => errorToast(error, "auth.identityUnlinkFailed"),
  });
}
