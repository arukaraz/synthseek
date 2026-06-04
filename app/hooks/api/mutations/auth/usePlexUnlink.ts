"use client";

import { toast } from "sonner";

import i18n from "@locale";
import { errorToast } from "@modules/errors";
import { trpc } from "@utils/trpc";

export function usePlexUnlink() {
  const utils = trpc.useUtils();

  return trpc.auth.unlinkPlex.useMutation({
    onSuccess: async () => {
      await utils.auth.me.invalidate();
      toast.success(i18n.t("mutations:auth.plexUnlinked"));
    },
    onError: (error) => {
      errorToast(error, "auth.plexUnlinkFailed");
    },
  });
}
