"use client";

import { toast } from "sonner";

import { useInvalidateLibrarySources } from "@hooks/api/queries/library-source/useInvalidateLibrarySources";
import i18n from "@locale";
import { errorToast } from "@modules/errors";
import { trpc } from "@utils/trpc";

export function usePlexUnlink() {
  const utils = trpc.useUtils();
  const invalidateLibrarySources = useInvalidateLibrarySources();

  return trpc.auth.unlinkPlex.useMutation({
    onSuccess: async () => {
      invalidateLibrarySources();
      await Promise.all([utils.auth.me.invalidate(), utils.playback.sources.accounts.invalidate()]);
      toast.success(i18n.t("mutations:auth.plexUnlinked"));
    },
    onError: (error) => {
      errorToast(error, "auth.plexUnlinkFailed");
    },
  });
}
