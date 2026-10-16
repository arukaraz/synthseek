"use client";

import { toast } from "sonner";

import { useInvalidateLibrarySources } from "@hooks/api/queries/library-source/useInvalidateLibrarySources";
import i18n from "@locale";
import { errorToast } from "@modules/errors";
import { trpc } from "@utils/trpc";

function usePlexUnlinkHandlers() {
  const utils = trpc.useUtils();
  const invalidateLibrarySources = useInvalidateLibrarySources();

  return {
    onSuccess: async () => {
      invalidateLibrarySources();
      await Promise.all([utils.auth.me.invalidate(), utils.playback.sources.accounts.invalidate()]);
      toast.success(i18n.t("mutations:auth.plexUnlinked"));
    },
    onError: (error: unknown) => {
      errorToast(error, "auth.plexUnlinkFailed");
    },
  };
}

export function usePlexUnlink() {
  return trpc.auth.unlinkPlex.useMutation(usePlexUnlinkHandlers());
}

export function useUnlinkPlexWithPassword() {
  return trpc.auth.unlinkPlexWithPassword.useMutation(usePlexUnlinkHandlers());
}
