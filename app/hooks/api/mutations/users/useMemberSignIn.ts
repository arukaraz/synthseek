import { toast } from "sonner";

import i18n from "@locale";
import { errorToast } from "@modules/errors";
import { trpc } from "@utils/trpc";

export function useApproveMember() {
  const utils = trpc.useUtils();
  return trpc.users.approve.useMutation({
    onSuccess: () => {
      void utils.users.list.invalidate();
      toast.success(i18n.t("mutations:users.approved"));
    },
    onError: (error) => errorToast(error, "users.approveFailed"),
  });
}

export function useRejectMember() {
  const utils = trpc.useUtils();
  return trpc.users.reject.useMutation({
    onSuccess: () => {
      void utils.users.list.invalidate();
      toast.success(i18n.t("mutations:users.rejected"));
    },
    onError: (error) => errorToast(error, "users.rejectFailed"),
  });
}

export function useUnlinkMemberIdentity() {
  const utils = trpc.useUtils();
  return trpc.users.unlinkIdentity.useMutation({
    onSuccess: () => {
      void utils.users.list.invalidate();
      toast.success(i18n.t("mutations:users.identityUnlinked"));
    },
    onError: (error) => errorToast(error, "users.identityUnlinkFailed"),
  });
}
