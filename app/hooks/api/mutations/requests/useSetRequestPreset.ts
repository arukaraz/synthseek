import { toast } from "sonner";

import i18n from "@locale";
import { errorToast } from "@modules/errors";
import { trpc } from "@utils/trpc";

export function useSetMyRequestPreset() {
  const utils = trpc.useUtils();
  return trpc.requestPreset.setMine.useMutation({
    onSuccess: () => {
      void utils.requestPreset.mine.invalidate();
      toast.success(i18n.t("mutations:requestPreset.saved"));
    },
    onError: (error) => errorToast(error, "requestPreset.saveFailed"),
  });
}

export function useSetServerRequestPreset() {
  const utils = trpc.useUtils();
  return trpc.requestPreset.setServer.useMutation({
    onSuccess: () => {
      void utils.requestPreset.mine.invalidate();
      toast.success(i18n.t("mutations:requestPreset.serverSaved"));
    },
    onError: (error) => errorToast(error, "requestPreset.saveFailed"),
  });
}

export function useSetMemberRequestPreset() {
  const utils = trpc.useUtils();
  return trpc.requestPreset.setForMember.useMutation({
    onSuccess: (_data, { userId }) => {
      void utils.requestPreset.forMember.invalidate({ userId });
      toast.success(i18n.t("mutations:requestPreset.memberSaved"));
    },
    onError: (error) => errorToast(error, "requestPreset.saveFailed"),
  });
}
